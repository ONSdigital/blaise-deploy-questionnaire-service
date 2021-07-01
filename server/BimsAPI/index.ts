import {EnvironmentVariables} from "../Config";
import express, {Request, Response, Router} from "express";
import {SendAPIRequest} from "../SendRequest";
import AuthProvider from "../AuthProvider";
import {auditLogError, auditLogInfo} from "../audit_logging";
import * as PinoHttp from "pino-http";

class BimsAPI {
    private readonly BIMS_API_URL: string;
    private readonly BIMS_CLIENT_ID: string;
    private readonly logger: PinoHttp.HttpLogger;
    private authProvider: AuthProvider;

    constructor(BIMS_API_URL: string, BIMS_CLIENT_ID: string, logger: PinoHttp.HttpLogger) {
        this.BIMS_API_URL = BIMS_API_URL;
        this.BIMS_CLIENT_ID = BIMS_CLIENT_ID;
        this.logger = logger;
        this.authProvider = new AuthProvider(BIMS_CLIENT_ID);
    }

    async getStartDate(req: Request, res: Response, instrumentName: string): Promise<[number, any, string]> {
        const url = `${this.BIMS_API_URL}/tostartdate/${instrumentName}`;

        const authHeader = await this.authProvider.getAuthHeader();
        req.log.info(authHeader, "Obtained Google auth request header");

        const [status, result, contentType] = await SendAPIRequest(this.logger, req, res, url, "get", null, authHeader);

        return [status, result, contentType];
    }

    async deleteStartDate(req: Request, res: Response, instrumentName: string): Promise<[number, any, string]> {
        const url = `${this.BIMS_API_URL}/tostartdate/${instrumentName}`;

        const authHeader = await this.authProvider.getAuthHeader();
        req.log.info(authHeader, "Obtained Google auth request header");

        const [status, result, contentType] = await SendAPIRequest(this.logger, req, res, url, "DELETE", null, authHeader);

        return [status, result, contentType];
    }

    async createStartDate(req: Request, res: Response, instrumentName: string, data: any): Promise<[number, any, string]> {
        const url = `${this.BIMS_API_URL}/tostartdate/${instrumentName}`;

        const authHeader = await this.authProvider.getAuthHeader();
        req.log.info(authHeader, "Obtained Google auth request header");

        const [status, result, contentType] = await SendAPIRequest(this.logger, req, res, url, "POST", data, authHeader);

        return [status, result, contentType];
    }

    async updateStartDate(req: Request, res: Response, instrumentName: string, data: any): Promise<[number, any, string]> {
        const url = `${this.BIMS_API_URL}/tostartdate/${instrumentName}`;

        const authHeader = await this.authProvider.getAuthHeader();
        req.log.info(authHeader, "Obtained Google auth request header");

        const [status, result, contentType] = await SendAPIRequest(this.logger, req, res, url, "PATCH", data, authHeader);

        return [status, result, contentType];
    }
}

export default function BimsAPIRouter(environmentVariables: EnvironmentVariables, logger: any): Router {
    const {BIMS_API_URL, BIMS_CLIENT_ID}: EnvironmentVariables = environmentVariables;
    const router = express.Router();

    const bimsAPI = new BimsAPI(BIMS_API_URL, BIMS_CLIENT_ID, logger);

    router.post("/api/tostartdate/:instrumentName", async function (req: Request, res: Response) {
        const {instrumentName} = req.params;
        const data = req.body;

        let [status, result, contentType] = await bimsAPI.getStartDate(req, res, instrumentName);

        const startDateExists = (status === 200 && result.livedate.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}.{1}[0-9]{2}:[0-9]{2}:[0-9]{2}/) !== null);

        if (startDateExists && data.livedate === "") {
            const [status, result] = await bimsAPI.deleteStartDate(req, res, instrumentName);

            if (status === 204) {
                auditLogInfo(req.log, `Successfully removed TO start date for questionnaire ${instrumentName}`);
                res.status(200).json(result);
            } else {
                auditLogError(req.log, `Failed to remove TO start date for questionnaire ${instrumentName}`);
                res.status(500).json(result);
            }

            res.status(status).json(result);
            return;
        }

        if (startDateExists) {
            [status, result, contentType] = await bimsAPI.updateStartDate(req, res, instrumentName, data);
        } else {
            [status, result, contentType] = await bimsAPI.createStartDate(req, res, instrumentName, data);
        }

        if (status === 200 || status === 201) {
            auditLogInfo(req.log, `Successfully set TO start date to ${data.livedate} for questionnaire ${instrumentName}`);
        } else {
            auditLogError(req.log, `Failed to set TO start date to ${data.livedate} for questionnaire ${instrumentName}`);
        }

        // If status is successful but contentType is not application/json
        if (status >= 200 && status < 300 && contentType !== "application/json") {
            req.log.warn("Response was not JSON, most likely invalid auth");
            res.status(400).json([]);
            return;
        }

        res.status(status).json(result);
    });


    return router;
}
