import * as PinoHttp from "pino-http";
import AuthProvider from "../authProvider";
import { Request, Response } from "express";
import { SendAPIRequest } from "../sendRequest";

export class BimsAPI {
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
