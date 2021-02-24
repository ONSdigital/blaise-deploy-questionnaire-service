import express, {Request, Response, Router} from "express";
import {Instrument} from "../../Interfaces";
import axios, {AxiosRequestConfig} from "axios";
import Functions from "../Functions";
import {EnvironmentVariables} from "../Config";
import {auditLogError, auditLogInfo} from "../audit_logging";

type PromiseResponse = [number, any];

export default function BlaiseAPIRouter(environmentVariables: EnvironmentVariables, logger: any): Router {
    const {BLAISE_API_URL, BUCKET_NAME, SERVER_PARK}: EnvironmentVariables = environmentVariables;
    const router = express.Router();

    // Generic function to make requests to the API
    function SendBlaiseAPIRequest(req: Request, res: Response, url: string, method: AxiosRequestConfig["method"], data: any = null) {
        logger(req, res);
        const fullUrl = `http://${BLAISE_API_URL}${url}`;
        return new Promise((resolve: (object: PromiseResponse) => void) => {
            axios({
                url: fullUrl,
                method: method,
                data: data,
                validateStatus: function (status) {
                    return status >= 200;
                },
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    req.log.info(`Status ${response.status} from ${method} ${url}`);
                } else {
                    req.log.warn(`Status ${response.status} from ${method} ${url}`);
                }
                resolve([response.status, response.data]);
            }).catch((error) => {
                req.log.error(error, `${method} ${url} endpoint failed`);
                resolve([500, null]);
            });
        });
    }

    // Get health status for Blaise connections
    router.get("/api/health", function (req: ResponseQuery, res: Response) {
        const url = "/api/v1/health";

        SendBlaiseAPIRequest(req, res, url, "GET")
            .then(([status, data]) => {
                res.status(status).json(data);
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
                    auditLogInfo(req.log, `Successfully installed questionnaire ${instrumentName}`);
                } else {
                    auditLogInfo(req.log, `Failed to install questionnaire ${instrumentName}`);
                }
                res.status(status).json(data);
            });
    });

    // Get a specific instrument information
    router.get("/api/instruments/:instrumentName", function (req: ResponseQuery, res: Response) {
        const {instrumentName} = req.params;
        const url = `/api/v1/cati/serverparks/${SERVER_PARK}/instruments/${instrumentName}`;
        SendBlaiseAPIRequest(req, res, url, "GET")
            .then(([status, data]) => {
                if (status === 200) {
                    auditLogInfo(req.log, `Attempting to install existing questionnaire ${instrumentName}`);
                } else if (status !== 404) {
                    auditLogError(req.log, `Failed to install questionnaire ${instrumentName}, unable to verify if questionnaire is already installed`);
                }
                res.status(status).json(data);
            });
    });

    // Delete an instrument
    router.delete("/api/instruments/:instrumentName", function (req: ResponseQuery, res: Response) {
        const {instrumentName} = req.params;
        const url = `/api/v1/serverparks/${SERVER_PARK}/instruments/${instrumentName}?name=${instrumentName}`;
        SendBlaiseAPIRequest(req, res, url, "DELETE")
            .then(([status, data]) => {
                if (status === 204) {
                    auditLogInfo(req.log, `Successfully uninstalled questionnaire ${instrumentName}`);
                } else if (status === 404) {
                    auditLogError(req.log, `Attempted to uninstall questionnaire ${instrumentName} that doesn't exist`);
                } else {
                    auditLogError(req.log, `Failed to uninstall questionnaire ${instrumentName}`);
                }
                res.status(status).json(data);
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
                    req.log.info({instruments}, `${instruments.length} instrument/s currently installed.`);
                    res.status(status).json(instruments);
                } else {
                    res.status(status).json(data);
                }
            });
    });

    return router;
}

