import path from "path";
import { fileURLToPath } from "url"; // ADDED: Required to reconstruct __dirname in an ES Module environment

import { BlaiseApiClient } from "blaise-api-node-client";
import { Auth, newLoginHandler } from "blaise-login-react-server";
import { BusClient } from "blaise-uac-service-node-client";
import dotenv from "dotenv";
import ejs from "ejs";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { type HttpLogger } from "pino-http";

import AuditLogger from "./auditLogging/logger.js";
import { BimsApi } from "./bimsApi/bimsApi.js";
import { type Config } from "./config.js";
import newAuditHandler from "./handlers/auditHandler.js";
import newBimsHandler from "./handlers/bimsHandler.js";
import newBlaiseHandler from "./handlers/blaiseHandler.js";
import newBusHandler from "./handlers/busHandler.js";
import { type BusClientLike } from "./handlers/busHandler.js";
import newClientLogHandler from "./handlers/clientLogHandler.js";
import createDonorCasesCloudFunctionHandler from "./handlers/cloudFunctionHandler.js";
import { reissueNewDonorCaseCloudFunctionHandler } from "./handlers/cloudFunctionHandler.js";
import { getUsersByRoleCloudFunctionHandler } from "./handlers/cloudFunctionHandler.js";
import HealthCheckHandler from "./handlers/healthCheckHandler.js";
import newUploadHandler from "./handlers/uploadHandler.js";
import createLogger from "./pino/index.js";
import StorageManager from "./storage/storage.js";

// ADDED: Reconstruct __dirname for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

export function newServer(config: Config, logger: HttpLogger = createLogger()): Express {
  const blaiseApiClient = new BlaiseApiClient(config.BlaiseApiUrl);
  const auth = new Auth(config);

  const bimsAPI = new BimsApi(config.BimsApiUrl, config.BimsClientId);
  const BusClientConstructor = BusClient as unknown as new (
    url: string,
    clientId: string,
  ) => BusClientLike;
  const busApiClient = new BusClientConstructor(config.BusApiUrl, config.BusClientId);
  const storageManager = new StorageManager(config);
  const auditLogger = new AuditLogger(config.ProjectId);

  const loginHandler = newLoginHandler(auth, blaiseApiClient);
  const bimsHandler = newBimsHandler(bimsAPI, auth, auditLogger);
  const blaiseHandler = newBlaiseHandler(blaiseApiClient, config.ServerPark, auth, auditLogger);
  const busHandler = newBusHandler(busApiClient, auth);
  const uploadHandler = newUploadHandler(storageManager, auth, auditLogger);
  const auditHandler = newAuditHandler(auditLogger);
  const clientLogHandler = newClientLogHandler(auth);
  const createDonorCasesHandler = createDonorCasesCloudFunctionHandler(
    config.CreateDonorCasesCloudFunctionUrl,
  );
  const reissueNewDonorCaseHandler = reissueNewDonorCaseCloudFunctionHandler(
    config.ReissueNewDonorCaseCloudFunctionUrl,
  );
  const getUsersByRoleHandler = getUsersByRoleCloudFunctionHandler(
    config.GetUsersByRoleCloudFunctionUrl,
  );

  const server = express();

  // const logger: HttpLogger = createLogger();
  server.use(logger);

  server.use("/", loginHandler);
  server.use(express.json());

  // where ever the react built package is
  const buildFolder = "../../../build";

  // treat the index.html as a template and substitute the values at runtime
  server.set("views", path.join(__dirname, buildFolder));
  server.engine("html", ejs.renderFile);
  server.use("/static", express.static(path.join(__dirname, `${buildFolder}/static`)));

  server.use("/", uploadHandler);
  server.use("/", blaiseHandler);
  server.use("/", bimsHandler);
  server.use("/", busHandler);
  server.use("/", auditHandler);
  server.use("/", clientLogHandler);
  server.use("/", createDonorCasesHandler);
  server.use("/", reissueNewDonorCaseHandler);
  server.use("/", getUsersByRoleHandler);
  server.use("/", HealthCheckHandler());

  server.get(/.*/, function (req: Request, res: Response) {
    res.render("index.html");
  });

  server.use(function (err: Error, req: Request, res: Response, _next: NextFunction) {
    req.log.error(err, err.message);
    res.status(500).sendFile(path.join(__dirname, "../../../src/views/500.html"));
  });

  return server;
}
