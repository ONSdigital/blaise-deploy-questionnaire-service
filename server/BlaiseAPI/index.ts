import express, {Request, Response, Router} from "express";
import {Instrument} from "../../Interfaces";
import axios, {AxiosRequestConfig} from "axios";
import Functions from "../Functions";
import {EnvironmentVariables} from "../Config";

export default function BlaiseAPIRouter(environmentVariables: EnvironmentVariables, logger: any): Router {
    const {BLAISE_API_URL, BUCKET_NAME, SERVER_PARK}: EnvironmentVariables = environmentVariables;
    const router = express.Router();

    // Generic function to make requests to the API
    function SendBlaiseAPIRequest(req: Request, res: Response, url: string, method: AxiosRequestConfig["method"], data: any = null) {
        logger(req, res);
        req.log.info(`${method} ${url} endpoint called`);
        const fullUrl = `http://${BLAISE_API_URL}${url}`;

        axios({
            url: fullUrl,
            method: method,
            data: data
        }).then((response) => {
            req.log.info(`Call to ${method} ${url}`);
            res.status(response.status).json(response.data);
        }).catch((error) => {
            req.log.error(error, `Call to ${method} ${url}`);
            res.status(error.response.status).json(error);
        });
    }

    // Get health status for Blaise connections
    router.get("/api/health/diagnosis", function (req: ResponseQuery, res: Response) {
        const url = "/api/v1/health/diagnosis";
        axios({
            url: `http://${BLAISE_API_URL}/${url}`,
            method: "GET"
        }).then((response) => {
            req.log.info(`Call to GET ${url}`);
            res.status(response.status).json(response.data);
        }).catch((error) => {
            req.log.error(error, `Call to ${url}`);
            res.status(error.response.status).json(error.response.data);
        });
    });

    interface ResponseQuery extends Request {
        query: { filename: string }
    }

    // Call to install a specific instrument from a specified GCP bucket and file
    router.get("/api/install", function (req: ResponseQuery, res: Response) {
        const {filename} = req.query;
        const data = {
            "instrumentName": filename.replace(/\.[a-zA-Z]*$/, ""),
            "instrumentFile": filename,
            "bucketPath": BUCKET_NAME
        };
        const url = `/api/v1/serverparks/${SERVER_PARK}/instruments`;
        SendBlaiseAPIRequest(req, res, url, "POST", data);

    });

    // Check if a specific instruments exists
    // router.get("/api/instruments/:instrumentName/exists", function (req: ResponseQuery, res: Response) {
    //     const {instrumentName} = req.params;
    //     const url = `/api/v1/serverparks/${SERVER_PARK}/instruments/${instrumentName}/exists`;
    //     SendBlaiseAPIRequest(req, res, url, "GET");
    // });

    // Get a specific instrument information
    router.get("/api/instruments/:instrumentName", function (req: ResponseQuery, res: Response) {
        const {instrumentName} = req.params;
        const url = `/api/v1/cati/serverparks/${SERVER_PARK}/instruments/${instrumentName}`;
        SendBlaiseAPIRequest(req, res, url, "GET");
    });

    // Delete an instrument
    router.delete("/api/instruments/:instrumentName", function (req: ResponseQuery, res: Response) {
        const {instrumentName} = req.params;
        const url = `/api/v1/serverparks/${SERVER_PARK}/instruments/${instrumentName}?name=${instrumentName}`;
        SendBlaiseAPIRequest(req, res, url, "DELETE");
    });

    // Get list of all instruments installed in a specified server park
    router.get("/api/instruments", function (req: ResponseQuery, res: Response) {
        logger(req, res);
        req.log.info("/api/instrument endpoint called");
        axios({
            url: `http://${BLAISE_API_URL}/api/v1/cati/serverparks/${SERVER_PARK}/instruments`,
            method: "GET"
        }).then((response) => {
            req.log.info({responseData: response.data}, `Call to /api/v1/serverparks/${SERVER_PARK}/instruments`);
            const instruments: Instrument[] = response.data;
            instruments.forEach(function (element: Instrument) {
                element.fieldPeriod = Functions.field_period_to_text(element.name);
            });
            res.status(response.status).json(response.data);
        }).catch((error) => {
            req.log.error(error, `Call to /api/v1/serverparks/${SERVER_PARK}/instruments`);
            res.status(error.response.status).json(error);
        });
    });

    return router;
}

