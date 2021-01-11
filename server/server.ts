import express, {NextFunction, Request, Response} from "express";
import axios from "axios";
import path from "path";
import ejs from "ejs";
import dotenv from "dotenv";
import InstrumentRouter from "./Instuments";
import {getEnvironmentVariables} from "./Config";

if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    dotenv.config({path: __dirname + "/../../.env"});
}

import {loadingByChunks, initUploading} from "./storage/uploadByChunk";

const server = express();
import {checkFile} from "./storage/helpers";
import * as QueryString from "querystring";

//axios.defaults.timeout = 10000;

// where ever the react built package is
const buildFolder = "../../build";

// load the .env variables in the server
const {BLAISE_API_URL, BUCKET_NAME} = getEnvironmentVariables();

// treat the index.html as a template and substitute the values at runtime
server.set("views", path.join(__dirname, buildFolder));
server.engine("html", ejs.renderFile);
server.use(
    "/static",
    express.static(path.join(__dirname, `${buildFolder}/static`)),
);

// Load api Instruments routes from InstrumentRouter
server.use("/api", InstrumentRouter(BLAISE_API_URL, "VM_EXTERNAL_WEB_URL"));

server.post("/upload", loadingByChunks);

server.post("/upload/init", initUploading);

server.get("/bucket", function (req: Request, res: Response) {
    const {filename} = req.query;
    checkFile(filename)
        .then((file) => {
            if (!file.found) {
                res.status(404).json("Not found");
            }
            res.status(200).json(file);
        }).catch((error) => {
        console.log("Failed calling checkFile");
        res.status(500).json(error);
    });

});

interface query extends Request {query: {filename: string}};

server.get("/api/install", function (req: query, res: Response) {
    const {filename} = req.query;
    axios({
        url: "http://" + BLAISE_API_URL + "/api/v1/serverparks/LocalDevelopment/instruments",
        method: "POST",
        data: {
            "instrumentName": filename.replace(/\.[a-zA-Z]*$/,""),
            "instrumentFile": filename,
            "bucketPath": BUCKET_NAME
        }
    }).then((response) => {
        console.log(response);
    }).catch((error) => {
        console.log(error);
    });
    res.status(200).json("!");
});


// Health Check endpoint
server.get("/health_check", async function (req: Request, res: Response) {
    console.log("Heath Check endpoint called");
    res.status(200).json({status: 200});
});

server.get("*", function (req: Request, res: Response) {
    res.render("index.html");
});

server.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err.stack);
    res.render("../views/500.html", {});
});
export default server;
