import express, {Request, Response, Router} from "express";
import {Instrument} from "../../Interfaces";
import axios, {AxiosRequestConfig} from "axios";
import Functions from "../Functions";
import {EnvironmentVariables} from "../Config";
import { logToAudit } from "../audit_logging";

type PromiseResponse = [number, any];

export default function BlaiseAPIRouter(environmentVariables: EnvironmentVariables, logger: any): Router {
    const {BLAISE_API_URL, BUCKET_NAME, SERVER_PARK}: EnvironmentVariables = environmentVariables;
    const router = express.Router();

    // Generic function to make requests to the API
    function SendBlaiseAPIRequest(req: Request, res: Response, url: string, method: AxiosRequestConfig["method"], data: any = null) {
        logger(req, res);
        req.log.info(`${method} ${url} endpoint called`);
        const fullUrl = `http://${BLAISE_API_URL}${url}`;
        return new Promise((resolve: (object: PromiseResponse) => void) => {
            axios({
                url: fullUrl,
                method: method,
                data: data
            }).then((response) => {
                req.log.info(`Status ${response.status} from ${method} ${url}`);
                resolve([response.status, response.data]);
            }).catch((error) => {
                let statusCode: number;
                try {
                    statusCode = error.response.status;
                    req.log.error(error, `Status ${statusCode} from ${method} ${url}`);
                } catch (error) {
                    req.log.error(error, `Failed to retrieve status code from from ${method} ${url}`);
                    statusCode = 500;
                }
                resolve([statusCode, null]);
            });
        });
    }

    // Get health status for Blaise connections
    router.get("/api/health", function (req: ResponseQuery, res: Response) {
        const url = "/api/v1/health";
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
        const instrumentName = filename.replace(/\.[a-zA-Z]*$/, "");
        const data = {
            "instrumentName": instrumentName,
            "instrumentFile": filename,
            "bucketPath": BUCKET_NAME
        };
        const url = `/api/v1/serverparks/${SERVER_PARK}/instruments`;
        SendBlaiseAPIRequest(req, res, url, "POST", data)
            .then(([status, data]) => {
                if (status === 201) {
                    logToAudit(`Successfully installed questionnaire ${instrumentName}`, "INFO");
                } else {
                    logToAudit(`Failed to install questionnaire ${instrumentName}`, "ERROR");
                }
                res.status(status).json(data);
            })
            .catch(() => {
                res.status(500).json("Request failed");
            });
    });

    // Get a specific instrument information
    router.get("/api/instruments/:instrumentName", function (req: ResponseQuery, res: Response) {
        const {instrumentName} = req.params;
        const url = `/api/v1/cati/serverparks/${SERVER_PARK}/instruments/${instrumentName}`;
        SendBlaiseAPIRequest(req, res, url, "GET")
            .then(([status, data]) => {
                if (status === 200) {
                    logToAudit(`Attempting to install existing questionnaire ${instrumentName}`, "INFO");
                } else if (status !== 404) {
                    logToAudit(`Failed to install questionnaire ${instrumentName}, unable to verify if questionnaire is already installed`, "ERROR");
                }
                res.status(status).json(data);
            })
            .catch(() => {
                res.status(500).json("Request failed");
            });
    });

    // Delete an instrument
    router.delete("/api/instruments/:instrumentName", function (req: ResponseQuery, res: Response) {
        const {instrumentName} = req.params;
        const url = `/api/v1/serverparks/${SERVER_PARK}/instruments/${instrumentName}?name=${instrumentName}`;
        SendBlaiseAPIRequest(req, res, url, "DELETE")
            .then(([status, data]) => {
                if (status === 204) {
                    logToAudit(`Successfully deleted questionnaire ${instrumentName}`, "INFO");
                } else if (status === 404) {
                    logToAudit(`Attempted to delete questionnaire ${instrumentName} that doesn't exist`, "ERROR");
                } else {
                    logToAudit(`Failed to delete questionnaire ${instrumentName}`, "ERROR");
                }
                res.status(status).json(data);
            })
            .catch(() => {
                res.status(500).json("Request failed");
            });
    });

    // Get list of all instruments installed in a specified server park
    router.get("/api/instruments", function (req: ResponseQuery, res: Response) {
        logger(req, res);
        const url = `/api/v1/cati/serverparks/${SERVER_PARK}/instruments`;
        SendBlaiseAPIRequest(req, res, url, "GET")
            .then(([status, data]) => {
                if (status === 200) {
                    const instruments: Instrument[] = data;
                    instruments.forEach(function (element: Instrument) {
                        element.fieldPeriod = Functions.field_period_to_text(element.name);
                    });
                    res.status(status).json(instruments);
                } else {
                    res.status(status).json(data);
                }
            })
            .catch(() => {
                res.status(500).json("Request failed");
            });
    });

    return router;
}

