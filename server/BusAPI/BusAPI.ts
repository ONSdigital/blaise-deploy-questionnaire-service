import * as PinoHttp from "pino-http";
import AuthProvider from "../AuthProvider";
import {Request, Response} from "express";
import {SendAPIRequest} from "../SendRequest";

export class BusAPI {
    private readonly BUS_API_URL: string;
    private readonly BUS_CLIENT_ID: string;
    private readonly logger: PinoHttp.HttpLogger;
    private authProvider: AuthProvider;

    constructor(BIMS_API_URL: string, BIMS_CLIENT_ID: string, logger: PinoHttp.HttpLogger) {
        this.BUS_API_URL = BIMS_API_URL;
        this.BUS_CLIENT_ID = BIMS_CLIENT_ID;
        this.logger = logger;
        this.authProvider = new AuthProvider(BIMS_CLIENT_ID);
    }

    async generateUACsForInstrument(req: Request, res: Response, instrumentName: string): Promise<[number, any, string]> {
        const url = `${this.BUS_API_URL}/uacs/instrument/${instrumentName}`;

        const authHeader = await this.authProvider.getAuthHeader();
        req.log.info(authHeader, "Obtained Google auth request header");

        const [status, result, contentType] = await SendAPIRequest(this.logger, req, res, url, "POST", null, authHeader);

        return [status, result, contentType];
    }

    async getCountOfUACsForInstrument(req: Request, res: Response, instrumentName: string): Promise<[number, any, string]> {
        const url = `${this.BUS_API_URL}/instrument/${instrumentName}/count`;


        const authHeader = await this.authProvider.getAuthHeader();
        req.log.info(authHeader, "Obtained Google auth request header");

        const [status, result, contentType] = await SendAPIRequest(this.logger, req, res, url, "GET", null, authHeader);

        return [status, result, contentType];
    }
}
