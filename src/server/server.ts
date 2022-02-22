import express, { NextFunction, Request, Response, Express } from "express";
import path from "path";
import ejs from "ejs";
import dotenv from "dotenv";
import { getEnvironmentVariables } from "./config";
import createLogger from "./pino";
import { newLoginHandler, Auth } from "blaise-login-react-server";
import BlaiseApiClient from "blaise-api-node-client";
import newBimsHandler from "./handlers/bimsHandler";
import { BimsApi } from "./bimsAPI/bimsApi";
import newBlaiseHandler from "./handlers/blaiseHandler";
import newBusHandler from "./handlers/busHandler";
import BusApiClient from "bus-api-node-client";
import HealthCheckHandler from "./handlers/healthCheckHandler";
import StorageManager from "./storage/storage";
import newUploadHandler from "./handlers/uploadHandler";
import AuditHandler from "./handlers/auditHandler";


if (process.env.NODE_ENV === "production") {
    import("@google-cloud/profiler").then((profiler) => {
        profiler.start({ logLevel: 4 }).catch((err: unknown) => {
            console.log(`Failed to start profiler: ${err}`);
        });
    });
} else {
    dotenv.config();
}

export function newServer(): Express {
    const config = getEnvironmentVariables();
    const blaiseApiClient = new BlaiseApiClient(config.BlaiseApiUrl);
    const auth = new Auth(config);

    const bimsAPI = new BimsApi(config.BimsApiUrl, config.BimsClientId);
    const busApiClient = new BusApiClient(config.BusApiUrl, config.BusClientId);
    const storageManager = new StorageManager(config);

    const loginHandler = newLoginHandler(auth, blaiseApiClient);
    const bimsHandler = newBimsHandler(bimsAPI, auth);
    const blaiseHandler = newBlaiseHandler(blaiseApiClient, config.ServerPark, auth);
    const busHandler = newBusHandler(busApiClient, auth);
    const uploadHandler = newUploadHandler(storageManager, auth);

    const server = express();

    server.use("/", loginHandler);
    server.use(express.json());

    const logger: any = createLogger();
    server.use(logger);

    // where ever the react built package is
    const buildFolder = "../../build";

    // treat the index.html as a template and substitute the values at runtime
    server.set("views", path.join(__dirname, buildFolder));
    server.engine("html", ejs.renderFile);
    server.use("/static", express.static(path.join(__dirname, `${buildFolder}/static`)));

    server.use("/", uploadHandler);
    server.use("/", blaiseHandler);
    server.use("/", bimsHandler);
    server.use("/", busHandler);
    server.use("/", HealthCheckHandler());
    server.use("/", AuditHandler());

    server.get("*", function (req: Request, res: Response) {
        res.render("index.html");
    });

    server.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
        logger(req, res);
        req.log.error(err, err.message);
        res.render("../views/500.html", {});
    });
    return server;
}
