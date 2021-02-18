import express, {NextFunction, Request, Response} from "express";
import path from "path";
import ejs from "ejs";
import dotenv from "dotenv";
import {getEnvironmentVariables} from "./Config";
import createLogger from "./pino";

if (process.env.NODE_ENV !== "production") {
    dotenv.config({path: __dirname + "/../../.env"});
}

import {loadingByChunks, initUploading} from "./storage/uploadByChunk";

const server = express();
const logger = createLogger();
server.use(logger);

import {checkFile} from "./storage/helpers";
import BlaiseAPIRouter from "./BlaiseAPI";
import {getAuditLogs, logToAudit} from "./audit_logging";

//axios.defaults.timeout = 10000;

// where ever the react built package is
const buildFolder = "../../build";

// load the .env variables in the server
const environmentVariables = getEnvironmentVariables();
const {BUCKET_NAME} = environmentVariables;

// treat the index.html as a template and substitute the values at runtime
server.set("views", path.join(__dirname, buildFolder));
server.engine("html", ejs.renderFile);
server.use("/static", express.static(path.join(__dirname, `${buildFolder}/static`)));

server.post("/upload", loadingByChunks);

server.post("/upload/init", initUploading);

server.get("/bucket", function (req: Request, res: Response) {
    logger(req, res);
    const {filename} = req.query;
    req.log.info(`/bucket endpoint called with filename: ${filename}`);
    checkFile(filename)
        .then((file) => {
            if (!file.found) {
                req.log.warn(`File ${filename} not found in Bucket ${BUCKET_NAME}`);
                logToAudit(`Failed to install questionnaire ${filename}, file upload failed`, "ERROR");
                res.status(404).json("Not found");
                return;
            }
            req.log.info(`File ${filename} found in Bucket ${BUCKET_NAME}`);
            logToAudit(`Successfully uploaded questionnaire file ${filename}`, "INFO");
            res.status(200).json(file);
        })
        .catch((error) => {
            req.log.error(error, "Failed calling checkFile");
            logToAudit(`Failed to install questionnaire ${filename}, unable to verify if file had been uploaded`, "ERROR");
            res.status(500).json(error);
        });
});

server.get("/audit_logs", function (req: Request, res: Response) {
    logger(req, res);
    getAuditLogs()
        .then((file) => {
            req.log.info(`Retrieved audit logs ${BUCKET_NAME}`);
            res.status(200).json(file);
        })
        .catch((error) => {
            req.log.error(error, "Failed calling getAuditLogs");
            res.status(500).json(error);
        });
});

// All Endpoints calling the Blaise API
server.use("/", BlaiseAPIRouter(environmentVariables, logger));

// Health Check endpoint
server.get("/health_check", async function (req: Request, res: Response) {
    console.log("Heath Check endpoint called");
    res.status(200).json({status: 200});
});

server.get("*", function (req: Request, res: Response) {
    res.render("index.html");
});

server.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    logger(req, res);
    req.log.error(err, err.message);
    res.render("../views/500.html", {});
});

export default server;
