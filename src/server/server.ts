import express, { NextFunction, Request, Response, Express } from "express";
import path from "path";
import ejs from "ejs";
import dotenv from "dotenv";
import { Config } from "./config";
import { newLoginHandler, Auth } from "blaise-login-react/blaise-login-react-server";
import BlaiseApiClient from "blaise-api-node-client";
import newBimsHandler from "./handlers/bimsHandler";
import { BimsApi } from "./bimsApi/bimsApi";
import newBlaiseHandler from "./handlers/blaiseHandler";
import newBusHandler from "./handlers/busHandler";
import BusApiClient from "bus-api-node-client";
import HealthCheckHandler from "./handlers/healthCheckHandler";
import StorageManager from "./storage/storage";
import newUploadHandler from "./handlers/uploadHandler";
import createLogger from "./pino";
import { HttpLogger } from "pino-http";
import AuditLogger from "./auditLogging/logger";
import newAuditHandler from "./handlers/auditHandler";
import createDonorCasesCloudFunctionHandler from "./handlers/cloudFunctionHandler";
import { reissueNewDonorCaseCloudFunctionHandler } from "./handlers/cloudFunctionHandler";
import { getUsersByRoleCloudFunctionHandler } from "./handlers/cloudFunctionHandler";

if (process.env.NODE_ENV === "production") {
    import("@google-cloud/profiler").then((profiler) => {
        profiler.start({ logLevel: 4 }).catch((err: unknown) => {
            console.log(`Failed to start profiler: ${err}`);
        });
    });
} else {
    dotenv.config();
}

export function newServer(config: Config, logger: HttpLogger = createLogger()): Express {
    const blaiseApiClient = new BlaiseApiClient(config.BlaiseApiUrl);
    const auth = new Auth(config);

    const bimsAPI = new BimsApi(config.BimsApiUrl, config.BimsClientId);
    const busApiClient = new BusApiClient(config.BusApiUrl, config.BusClientId);
    const storageManager = new StorageManager(config);
    const auditLogger = new AuditLogger(config.ProjectId);

    const loginHandler = newLoginHandler(auth, blaiseApiClient);
    const bimsHandler = newBimsHandler(bimsAPI, auth, auditLogger);
    const blaiseHandler = newBlaiseHandler(blaiseApiClient, config.ServerPark, auth, auditLogger);
    const busHandler = newBusHandler(busApiClient, auth);
    const uploadHandler = newUploadHandler(storageManager, auth, auditLogger);
    const auditHandler = newAuditHandler(auditLogger);
    const createDonorCasesHandler = createDonorCasesCloudFunctionHandler(config.CreateDonorCasesCloudFunctionUrl);
    const reissueNewDonorCaseHandler = reissueNewDonorCaseCloudFunctionHandler(config.ReissueNewDonorCaseCloudFunctionUrl);
    const getUsersByRoleHandler = getUsersByRoleCloudFunctionHandler(config.GetUsersByRoleCloudFunctionUrl);

    const server = express();

    // const logger: HttpLogger = createLogger();
    server.use(logger);

    server.use("/", loginHandler);
    server.use(express.json());

    // where ever the react built package is
    const buildFolder = "../build";

    // treat the index.html as a template and substitute the values at runtime
    server.set("views", path.join(__dirname, buildFolder));
    server.engine("html", ejs.renderFile);
    server.use(
        "/static",
        express.static(path.join(__dirname, `${buildFolder}/static`))
    );

    server.use("/", uploadHandler);
    server.use("/", blaiseHandler);
    server.use("/", bimsHandler);
    server.use("/", busHandler);
    server.use("/", auditHandler);
    server.use("/", createDonorCasesHandler);
    server.use("/", reissueNewDonorCaseHandler);
    server.use("/", getUsersByRoleHandler);
    server.use("/", HealthCheckHandler());

    server.get("*", function (req: Request, res: Response) {
        res.render("index.html");
    });

    server.use(function (err: Error, req: Request, res: Response, _next: NextFunction) {
        req.log.error(err, err.message);
        res.render("../src/views/500.html", {});
    });
    return server;
}
