import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { BlaiseApiClient } from "blaise-api-node-client";
import { Auth, newLoginHandler } from "blaise-login-react-server";
import { BusClient } from "blaise-uac-service-node-client";
import dotenv from "dotenv";
import ejs from "ejs";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
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
import HealthCheckHandler from "./handlers/healthCheckHandler.js";
import newUploadHandler from "./handlers/uploadHandler.js";
import createLogger from "./pinoLogger.js";
import StorageManager from "./storageManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

export function newServer(config: Config, logger: HttpLogger = createLogger()): Express {
  const blaiseApiClient = new BlaiseApiClient(config.blaiseApiUrl);
  const auth = new Auth(config);

  const bimsClient = new BimsClient(config.bimsApiUrl, config.bimsClientId);
  const BusClientConstructor = BusClient as unknown as new (
    url: string,
    clientId: string,
  ) => BusClientLike;
  const busApiClient = new BusClientConstructor(config.busApiUrl, config.busClientId);
  const storageManager = new StorageManager(config);
  const auditLogger = new AuditLogger(config.projectId);

  const loginHandler = newLoginHandler(auth, blaiseApiClient);
  const bimsHandler = newBimsHandler(bimsClient, auth, auditLogger);
  const blaiseHandler = newBlaiseHandler(blaiseApiClient, config.serverPark, auth, auditLogger);
  const busHandler = newBusHandler(busApiClient, auth);
  const uploadHandler = newUploadHandler(storageManager, auth, auditLogger);
  const auditHandler = newAuditHandler(auditLogger);
  const clientLogHandler = newClientLogHandler(auth);
  const createDonorCasesHandler = newCloudFunctionHandler(
    "/api/cloudFunction/createDonorCases",
    config.createDonorCasesCloudFunctionUrl,
    auth,
    auditLogger,
    (req: Request, username: string) => {
      const questionnaireName =
        typeof req.body?.questionnaire_name === "string" ? req.body.questionnaire_name : "unknown";
      const role = typeof req.body?.role === "string" ? req.body.role : "unknown";

      return {
        successMessage: `${username} created donor cases for ${role} on ${questionnaireName}`,
        errorMessage: `${username} failed to create donor cases for ${role} on ${questionnaireName}`,
      };
    },
  );
  const reissueNewDonorCaseHandler = newCloudFunctionHandler(
    "/api/cloudFunction/reissueNewDonorCase",
    config.reissueNewDonorCaseCloudFunctionUrl,
    auth,
    auditLogger,
    (req: Request, username: string) => {
      const questionnaireName =
        typeof req.body?.questionnaire_name === "string" ? req.body.questionnaire_name : "unknown";
      const requestUser = typeof req.body?.user === "string" ? req.body.user : "unknown";

      return {
        successMessage: `${username} reissued donor case for ${requestUser} on ${questionnaireName}`,
        errorMessage: `${username} failed to reissue donor case for ${requestUser} on ${questionnaireName}`,
      };
    },
  );
  const getUsersByRoleHandler = newCloudFunctionHandler(
    "/api/cloudFunction/getUsersByRole",
    config.getUsersByRoleCloudFunctionUrl,
  );

  const server = express();

  server.use(logger);

  server.use("/", HealthCheckHandler());

  server.use("/", loginHandler);
  server.use(express.json());

  const buildRootCandidates = [
    path.resolve(process.cwd(), "build"),
    path.resolve(__dirname, "../../build"),
  ];
  const buildRoot = firstExistingPath(buildRootCandidates) ?? buildRootCandidates[0];
  const clientBuildCandidates = [path.resolve(buildRoot, "client"), buildRoot];
  const clientBuildFolder = firstExistingPath(clientBuildCandidates) ?? clientBuildCandidates[0];

  const errorPageCandidates = [
    path.resolve(__dirname, "../../src/server/views/500.html"),
    path.resolve(buildRoot, "500.html"),
    path.resolve(buildRoot, "views/500.html"),
  ];
  let errorPageContent: string | undefined;

  for (const filePath of errorPageCandidates) {
    if (fs.existsSync(filePath)) {
      errorPageContent = fs.readFileSync(filePath, "utf-8");
      break;
    }
  }

  server.set("views", clientBuildFolder);
  server.engine("html", ejs.renderFile);
  server.use("/assets", express.static(path.join(clientBuildFolder, "assets")));
  server.use("/static", express.static(path.join(clientBuildFolder, "static")));

  server.use("/", uploadHandler);
  server.use("/", blaiseHandler);
  server.use("/", bimsHandler);
  server.use("/", busHandler);
  server.use("/", auditHandler);
  server.use("/", clientLogHandler);
  server.use("/", createDonorCasesHandler);
  server.use("/", reissueNewDonorCaseHandler);
  server.use("/", getUsersByRoleHandler);

  server.use("/api", function (_req: Request, res: Response) {
    res.status(404).json({ message: "Not found" });
  });

  server.get(/.*/, function (req: Request, res: Response) {
    const appConfigJson = JSON.stringify({
      projectId: config.projectId,
      urlDomain: config.urlDomain,
    }).replace(/</g, "\\u003c");

    res.render("index.html", {
      appConfigJson,
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
