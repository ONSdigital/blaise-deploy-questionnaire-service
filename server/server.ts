import express, {NextFunction, Request, Response} from "express";
import axios from "axios";
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
import {Instrument} from "../Interfaces";
import Functions from "./Functions";

//axios.defaults.timeout = 10000;

// where ever the react built package is
const buildFolder = "../../build";

// load the .env variables in the server
const {BLAISE_API_URL, BUCKET_NAME, PROJECT_ID, SERVER_PARK} = getEnvironmentVariables();

// treat the index.html as a template and substitute the values at runtime
server.set("views", path.join(__dirname, buildFolder));
server.engine("html", ejs.renderFile);
server.use(
    "/static",
    express.static(path.join(__dirname, `${buildFolder}/static`)),
);

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
                res.status(404).json("Not found");
                return;
            }
            req.log.info(`File ${filename} found in Bucket ${BUCKET_NAME}`);
            res.status(200).json(file);
        })
        .catch((error) => {
            req.log.error(error, "Failed calling checkFile");
            res.status(500).json(error);
        });
});

interface ResponseQuery extends Request {
    query: { filename: string }
}

server.get("/api/install", function (req: ResponseQuery, res: Response) {
    logger(req, res);
    req.log.info("/api/install endpoint called");
    const {filename} = req.query;
    axios({
        url: `http://${BLAISE_API_URL}/api/v1/serverparks/${SERVER_PARK}/instruments`,
        method: "POST",
        data: {
            "instrumentName": filename.replace(/\.[a-zA-Z]*$/, ""),
            "instrumentFile": filename,
            "bucketPath": BUCKET_NAME
        }
    }).then((response) => {
        req.log.info(`Call to /api/v1/serverparks/${SERVER_PARK}/instruments successful`);
        res.status(response.status).json(response.data);
    }).catch((error) => {
        req.log.error(error, `Call to /api/v1/serverparks/${SERVER_PARK}/instruments failed`);
        res.status(500).json(error);
    });
});

server.get("/api/instruments/:instrumentName/exists", function (req: ResponseQuery, res: Response) {
    logger(req, res);
    req.log.info("/api/instruments/:instrumentName/exists endpoint called");
    const {instrumentName} = req.params;
    axios({
        url: `http://${BLAISE_API_URL}/api/v1/serverparks/${SERVER_PARK}/instruments/${instrumentName}/exists`,
        method: "GET"
    }).then((response) => {
        req.log.info(`Call to /api/v1/serverparks/${SERVER_PARK}/instruments/${instrumentName}/exists`);
        res.status(response.status).json(response.data);
    }).catch((error) => {
        req.log.error(error, `Call to /api/v1/serverparks/${SERVER_PARK}/instruments/${instrumentName}/exists`);
        res.status(500).json(error);
    });
});

server.get("/api/instruments/:instrumentName", function (req: ResponseQuery, res: Response) {
    logger(req, res);
    req.log.info("/api/instruments/:instrumentName endpoint called");
    const {instrumentName} = req.params;
    axios({
        url: `http://${BLAISE_API_URL}/api/v1/serverparks/${SERVER_PARK}/instruments/${instrumentName}`,
        method: "GET"
    }).then((response) => {
        req.log.info(`Call to /api/v1/serverparks/${SERVER_PARK}/instruments/${instrumentName}`);
        res.status(response.status).json(response.data);
    }).catch((error) => {
        req.log.error(error, `Call to /api/v1/serverparks/${SERVER_PARK}/instruments/${instrumentName}`);
        res.status(500).json(error);
    });
});

server.get("/api/instruments", function (req: ResponseQuery, res: Response) {
    logger(req, res);
    req.log.info("/api/instrument endpoint called");
    axios({
        url: `http://${BLAISE_API_URL}/api/v1/serverparks/${SERVER_PARK}/instruments`,
        method: "GET"
    }).then((response) => {
        console.log(response);
        req.log.info(`Call to /api/v1/serverparks/${SERVER_PARK}/instruments`);
        const instruments: Instrument[] = response.data;
        instruments.forEach(function (element: Instrument) {
            element.fieldPeriod = Functions.field_period_to_text(element.name);
        });
        res.status(response.status).json(response.data);
    }).catch((error) => {
        req.log.error(error, `Call to /api/v1/serverparks/${SERVER_PARK}/instruments`);
        res.status(500).json(error);
    });
});

//api/v1/serverparks/gusty/instruments
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
