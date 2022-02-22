import express, { NextFunction, Request, RequestHandler, Response, Express } from "express";
import path from "path";
import ejs from "ejs";
import dotenv from "dotenv";
import { getEnvironmentVariables } from "./config";
import createLogger from "./pino";
import bodyParser from "body-parser";
import { newLoginHandler, Auth } from "blaise-login-react-server";
import { checkFile, getBucketItems, getSignedUrl } from "./storage/helpers";
import { auditLogError, auditLogInfo, getAuditLogs } from "./auditLogging";
import BlaiseApiClient from "blaise-api-node-client";
import NewBimsHandler from "./handlers/bimsHandler";
import { BimsApi } from "./bimsAPI/bimsApi";
import NewBlaiseHandler from "./handlers/blaiseHandler";
import NewBusHandler from "./handlers/busHandler";
import BusApiClient from "bus-api-node-client";


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
    const loginHandler = newLoginHandler(auth, blaiseApiClient);

    const bimsAPI = new BimsApi(config.BimsApiUrl, config.BimsClientId);
    const busApiClient = new BusApiClient(config.BusApiUrl, config.BusClientId);

    const bimsHandler = NewBimsHandler(bimsAPI, auth);
    const blaiseHandler = NewBlaiseHandler(blaiseApiClient, config.ServerPark, auth);
    const busHandler = NewBusHandler(busApiClient, auth);

    const server = express();

    server.use("/", loginHandler);
    server.use(bodyParser.json() as RequestHandler);

    const logger: any = createLogger();
    server.use(logger);

    //axios.defaults.timeout = 10000;

    // where ever the react built package is
    const buildFolder = "../../build";

    // treat the index.html as a template and substitute the values at runtime
    server.set("views", path.join(__dirname, buildFolder));
    server.engine("html", ejs.renderFile);
    server.use("/static", express.static(path.join(__dirname, `${buildFolder}/static`)));

    server.get("/upload/init", auth.Middleware, function (req: Request, res: Response) {
        logger(req, res);
        const { filename } = req.query;
        if (typeof filename !== "string") {
            res.status(500).json("No filename provided");
            return;
        }

        getSignedUrl(filename)
            .then((url) => {
                req.log.info({ url }, `Signed url for ${filename} created in Bucket ${config.BucketName}`);
                res.status(200).json(url);
            })
            .catch((error) => {
                req.log.error(error, "Failed to obtain Signed Url");
                res.status(500).json("Failed to obtain Signed Url");
            });
    });

    server.get("/bucket/files", auth.Middleware, function (req: Request, res: Response) {
        logger(req, res);
        req.log.info("//bucket/files endpoint called");
        getBucketItems()
            .then((url) => {
                req.log.info(`Obtained list of files in Bucket ${config.BucketName}`);
                res.status(200).json(url);
            })
            .catch((error) => {
                req.log.error(error, "Failed to obtain list of files in bucket");
                res.status(500).json("Failed to list of files in bucket");
            });
    });


    server.get("/upload/verify", auth.Middleware, function (req: Request, res: Response) {
        logger(req, res);
        const { filename } = req.query;
        if (typeof filename !== "string") {
            res.status(500).json("No filename provided");
            return;
        }

        checkFile(filename)
            .then((file) => {
                if (!file.found) {
                    req.log.warn(`File ${filename} not found in Bucket ${config.BucketName}`);
                    auditLogError(req.log, `Failed to install questionnaire ${filename}, file upload failed`);
                    res.status(404).json("Not found");
                    return;
                }
                req.log.info(`File ${filename} found in Bucket ${config.BucketName}`);
                auditLogInfo(req.log, `Successfully uploaded questionnaire file ${filename}`);
                res.status(200).json(file);
            })
            .catch((error) => {
                req.log.error(error, "Failed calling checkFile");
                auditLogError(req.log, `Failed to install questionnaire ${filename}, unable to verify if file had been uploaded`);
                res.status(500).json(error);
            });
    });

    server.get("/api/audit", auth.Middleware, function (req: Request, res: Response) {
        logger(req, res);
        getAuditLogs()
            .then((logs) => {
                req.log.info("Retrieved audit logs");
                res.status(200).json(logs);
            })
            .catch((error) => {
                req.log.error(error, "Failed calling getAuditLogs");
                res.status(500).json(error);
            });
    });

    // All Endpoints calling the Blaise API
    server.use("/", blaiseHandler);
    server.use("/", bimsHandler);
    server.use("/", busHandler);

    // Health Check endpoint
    server.get("/dqs-ui/:version/health", async function (req: Request, res: Response) {
        console.log("Heath Check endpoint called");
        res.status(200).json({ healthy: true });
    });

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
