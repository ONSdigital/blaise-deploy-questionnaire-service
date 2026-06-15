import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { BlaiseApiClient } from "blaise-api-node-client";
import { Auth, newLoginHandler } from "blaise-login-react-server";
import { BusClient } from "blaise-uac-service-node-client";
import ejs from "ejs";
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
  type Router,
} from "express";
import helmet from "helmet";
import { type HttpLogger } from "pino-http";

import AuditLogger from "./auditLogger.js";
import { BimsClient } from "./bimsClient.js";
import { type Config } from "./config.js";
import newAuditHandler from "./handlers/auditHandler.js";
import newBimsHandler from "./handlers/bimsHandler.js";
import newBlaiseHandler from "./handlers/blaiseHandler.js";
import newBusHandler from "./handlers/busHandler.js";
import { type BusClientLike } from "./handlers/busHandler.js";
import newClientLogHandler from "./handlers/clientLogHandler.js";
import newCloudFunctionHandler from "./handlers/cloudFunctionHandler.js";
import newHealthCheckHandler from "./handlers/healthCheckHandler.js";
import newUploadHandler from "./handlers/uploadHandler.js";
import createLogger from "./pinoLogger.js";
import StorageManager from "./storageManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ServerDependencies {
  blaiseApiClient: BlaiseApiClient;
  auth: Auth;
  bimsClient: BimsClient;
  busApiClient: BusClientLike;
  storageManager: StorageManager;
  auditLogger: AuditLogger;
}

interface ServerHandlers {
  loginHandler: Router;
  bimsHandler: Router;
  blaiseHandler: Router;
  busHandler: Router;
  uploadHandler: Router;
  auditHandler: Router;
  clientLogHandler: Router;
  createDonorCasesHandler: Router;
  reissueNewDonorCaseHandler: Router;
  getUsersByRoleHandler: Router;
}

interface ClientBuildPaths {
  buildRoot: string;
  clientBuildFolder: string;
}

export function newServer(config: Config, logger: HttpLogger = createLogger()): Express {
  const dependencies = createServerDependencies(config);
  const handlers = createServerHandlers(config, dependencies);

  const server = express();

  server.set("trust proxy", 1);
  server.disable("x-powered-by");
  server.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "img-src": ["'self'", "data:", "https://cdn.ons.gov.uk"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  server.use(logger);

  server.use("/", newHealthCheckHandler());

  server.use("/", handlers.loginHandler);
  server.use(express.json({ limit: "100kb" }));

  const { buildRoot, clientBuildFolder } = resolveClientBuildPaths();
  const errorPageContent = loadErrorPageContent(buildRoot);

  configureClientRendering(server, clientBuildFolder);
  registerRouteHandlers(server, [
    handlers.uploadHandler,
    handlers.blaiseHandler,
    handlers.bimsHandler,
    handlers.busHandler,
    handlers.auditHandler,
    handlers.clientLogHandler,
    handlers.createDonorCasesHandler,
    handlers.reissueNewDonorCaseHandler,
    handlers.getUsersByRoleHandler,
  ]);

  server.use("/api", function (_req: Request, res: Response) {
    res.status(404).json({ message: "Not found" });
  });

  server.get(/.*/, function (req: Request, res: Response) {
    res.render("index.html", {
      appConfigJson: getRuntimeConfigJson(config),
    });
  });

  server.use(function (err: Error, req: Request, res: Response, _next: NextFunction) {
    req.log.error(err, err.message);

    if (errorPageContent != null) {
      res.status(500).type("text/html").send(errorPageContent);

      return;
    }

    res.status(500).type("text/plain").send("Sorry, there is a problem with the service.");
  });

  return server;
}

function firstExistingPath(candidates: string[]): string | undefined {
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function createServerDependencies(config: Config): ServerDependencies {
  return {
    blaiseApiClient: new BlaiseApiClient(config.blaiseApiUrl, { timeoutInMs: 5 * 60 * 1_000 }),
    auth: new Auth(config),
    bimsClient: new BimsClient(config.bimsApiUrl, config.bimsClientId),
    busApiClient: createBusApiClient(config),
    storageManager: new StorageManager(config),
    auditLogger: new AuditLogger(config.projectId),
  };
}

function createServerHandlers(config: Config, dependencies: ServerDependencies): ServerHandlers {
  const { blaiseApiClient, auth, bimsClient, busApiClient, storageManager, auditLogger } =
    dependencies;

  return {
    loginHandler: newLoginHandler(auth, blaiseApiClient),
    bimsHandler: newBimsHandler(bimsClient, auth, auditLogger),
    blaiseHandler: newBlaiseHandler(blaiseApiClient, config.serverPark, auth, auditLogger),
    busHandler: newBusHandler(busApiClient, auth),
    uploadHandler: newUploadHandler(storageManager, auth, auditLogger),
    auditHandler: newAuditHandler(auditLogger, auth),
    clientLogHandler: newClientLogHandler(auth),
    ...createCloudFunctionHandlers(config, auth, auditLogger),
  };
}

function createBusApiClient(config: Config): BusClientLike {
  const BusClientConstructor = BusClient as unknown as new (
    url: string,
    clientId: string,
  ) => BusClientLike;

  return new BusClientConstructor(config.busApiUrl, config.busClientId);
}

function createCloudFunctionHandlers(
  config: Config,
  auth: Auth,
  auditLogger: AuditLogger,
): Pick<
  ServerHandlers,
  "createDonorCasesHandler" | "reissueNewDonorCaseHandler" | "getUsersByRoleHandler"
> {
  return {
    createDonorCasesHandler: newCloudFunctionHandler(
      "/api/cloudFunction/createDonorCases",
      config.createDonorCasesCloudFunctionUrl,
      auth,
      auditLogger,
      (req: Request, username: string) => {
        const questionnaireName = readBodyStringValue(req.body, "questionnaire_name") ?? "unknown";
        const role = readBodyStringValue(req.body, "role") ?? "unknown";

        return {
          successMessage: `${username} created donor cases for ${role} on ${questionnaireName}`,
          errorMessage: `${username} failed to create donor cases for ${role} on ${questionnaireName}`,
        };
      },
    ),
    reissueNewDonorCaseHandler: newCloudFunctionHandler(
      "/api/cloudFunction/reissueNewDonorCase",
      config.reissueNewDonorCaseCloudFunctionUrl,
      auth,
      auditLogger,
      (req: Request, username: string) => {
        const questionnaireName = readBodyStringValue(req.body, "questionnaire_name") ?? "unknown";
        const requestUser = readBodyStringValue(req.body, "user") ?? "unknown";

        return {
          successMessage: `${username} reissued donor case for ${requestUser} on ${questionnaireName}`,
          errorMessage: `${username} failed to reissue donor case for ${requestUser} on ${questionnaireName}`,
        };
      },
    ),
    getUsersByRoleHandler: newCloudFunctionHandler(
      "/api/cloudFunction/getUsersByRole",
      config.getUsersByRoleCloudFunctionUrl,
    ),
  };
}

function resolveClientBuildPaths(): ClientBuildPaths {
  const buildRootCandidates = [
    path.resolve(process.cwd(), "build"),
    path.resolve(__dirname, "../../build"),
  ];
  const buildRoot = firstExistingPath(buildRootCandidates) ?? buildRootCandidates[0];
  const clientBuildCandidates = [path.resolve(buildRoot, "client"), buildRoot];
  const clientBuildFolder = firstExistingPath(clientBuildCandidates) ?? clientBuildCandidates[0];

  return { buildRoot, clientBuildFolder };
}

function loadErrorPageContent(buildRoot: string): string | undefined {
  const errorPageCandidates = [
    path.resolve(__dirname, "../../src/server/views/500.html"),
    path.resolve(buildRoot, "500.html"),
    path.resolve(buildRoot, "views/500.html"),
  ];
  const errorPagePath = firstExistingPath(errorPageCandidates);

  return errorPagePath ? fs.readFileSync(errorPagePath, "utf-8") : undefined;
}

function configureClientRendering(server: Express, clientBuildFolder: string): void {
  server.set("views", clientBuildFolder);
  server.engine("html", ejs.renderFile);
  server.use("/assets", express.static(path.join(clientBuildFolder, "assets")));
  server.use("/static", express.static(path.join(clientBuildFolder, "static")));
}

function registerRouteHandlers(server: Express, handlers: Router[]): void {
  handlers.forEach((handler) => {
    server.use("/", handler);
  });
}

function getRuntimeConfigJson(config: Config): string {
  return JSON.stringify({
    projectId: config.projectId,
    urlDomain: config.urlDomain,
  }).replace(/</g, "\\u003c");
}

function readBodyStringValue(body: unknown, key: string): string | undefined {
  if (typeof body !== "object" || body === null) {
    return undefined;
  }

  const value = (body as Record<string, unknown>)[key];

  return typeof value === "string" ? value : undefined;
}
