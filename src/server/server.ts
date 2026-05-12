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
import newHealthCheckHandler from "./handlers/healthCheckHandler.js";
import newUploadHandler from "./handlers/uploadHandler.js";
import createLogger from "./pinoLogger.js";
import StorageManager from "./storageManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

export function newServer(config: Config, logger: HttpLogger = createLogger()): Express {
  const blaiseApiClient = new BlaiseApiClient(config.BlaiseApiUrl);
  const auth = new Auth(config);

  const bimsClient = new BimsClient(config.BimsApiUrl, config.BimsClientId);
  const BusClientConstructor = BusClient as unknown as new (
    url: string,
    clientId: string,
  ) => BusClientLike;
  const busApiClient = new BusClientConstructor(config.BusApiUrl, config.BusClientId);
  const storageManager = new StorageManager(config);
  const auditLogger = new AuditLogger(config.ProjectId);

  const loginHandler = newLoginHandler(auth, blaiseApiClient);
  const bimsHandler = newBimsHandler(bimsClient, auth, auditLogger);
  const blaiseHandler = newBlaiseHandler(blaiseApiClient, config.ServerPark, auth, auditLogger);
  const busHandler = newBusHandler(busApiClient, auth);
  const uploadHandler = newUploadHandler(storageManager, auth, auditLogger);
  const auditHandler = newAuditHandler(auditLogger);
  const clientLogHandler = newClientLogHandler(auth);
  const createDonorCasesHandler = newCloudFunctionHandler(
    "/api/cloudFunction/createDonorCases",
    config.CreateDonorCasesCloudFunctionUrl,
    auth,
    auditLogger,
    (req: Request, username: string) => {
      const questionnaireName =
        typeof req.body?.questionnaire_name === "string" ? req.body.questionnaire_name : "unknown";
      const role = typeof req.body?.role === "string" ? req.body.role : "unknown";

      return {
        successMessage:
          `Successfully created donor cases for questionnaire ${questionnaireName} ` +
          `for role ${role} by ${username}`,
        errorMessage:
          `Failed to create donor cases for questionnaire ${questionnaireName} ` +
          `for role ${role} by ${username}`,
      };
    },
  );
  const reissueNewDonorCaseHandler = newCloudFunctionHandler(
    "/api/cloudFunction/reissueNewDonorCase",
    config.ReissueNewDonorCaseCloudFunctionUrl,
    auth,
    auditLogger,
    (req: Request, username: string) => {
      const questionnaireName =
        typeof req.body?.questionnaire_name === "string" ? req.body.questionnaire_name : "unknown";
      const requestUser =
        typeof req.body?.user === "string"
          ? req.body.user
          : typeof req.body?.role === "string"
            ? req.body.role
            : "unknown";

      return {
        successMessage:
          `Successfully reissued new donor case for questionnaire ${questionnaireName} ` +
          `for user ${requestUser} by ${username}`,
        errorMessage:
          `Failed to reissue new donor case for questionnaire ${questionnaireName} ` +
          `for user ${requestUser} by ${username}`,
      };
    },
  );
  const getUsersByRoleHandler = newCloudFunctionHandler(
    "/api/cloudFunction/getUsersByRole",
    config.GetUsersByRoleCloudFunctionUrl,
  );

  const server = express();

  server.use(logger);

  server.use("/", loginHandler);
  server.use(express.json());

  const buildFolder = path.join(__dirname, "../../../build");
  const errorPageCandidates = [
    path.join(__dirname, "../../../src/server/views/500.html"),
    path.join(buildFolder, "500.html"),
    path.join(buildFolder, "views/500.html"),
  ];
  const errorPagePath = errorPageCandidates.find((filePath) => fs.existsSync(filePath));

  server.set("views", buildFolder);
  server.engine("html", ejs.renderFile);
  server.use("/static", express.static(path.join(buildFolder, "static")));

  server.use("/", uploadHandler);
  server.use("/", blaiseHandler);
  server.use("/", bimsHandler);
  server.use("/", busHandler);
  server.use("/", auditHandler);
  server.use("/", clientLogHandler);
  server.use("/", createDonorCasesHandler);
  server.use("/", reissueNewDonorCaseHandler);
  server.use("/", getUsersByRoleHandler);
  server.use("/", newHealthCheckHandler());

  server.use("/api", function (_req: Request, res: Response) {
    res.status(404).json({ message: "Not found" });
  });

  server.get(/.*/, function (req: Request, res: Response) {
    res.render("index.html");
  });

  server.use(function (err: Error, req: Request, res: Response, _next: NextFunction) {
    req.log.error(err, err.message);

    if (errorPagePath != null) {
      res.status(500).sendFile(errorPagePath);

      return;
    }

    res.status(500).type("text/plain").send("Sorry, there is a problem with the service.");
  });

  return server;
}
