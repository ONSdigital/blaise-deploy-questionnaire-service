import express, { Request, Response, Router } from "express";
import { Auth } from "blaise-login-react/blaise-login-react-server";
import BusApiClient from "bus-api-node-client";

export default function NewBusHandler(busApiClient: BusApiClient, auth: Auth): Router {
    const router = express.Router();

    const busHandler = new BusHandler(busApiClient);
    router.post("/api/uacs/instrument/:instrumentName", auth.Middleware, busHandler.GenerateUacs);
    router.get("/api/uacs/instrument/:instrumentName/bycaseid", auth.Middleware, busHandler.GetUacsByCaseId);
    router.get("/api/uacs/instrument/:instrumentName/count", auth.Middleware, busHandler.GetUacCount);
    return router;
}

export class BusHandler {
    busApiClient: BusApiClient;

    constructor(busApiClient: BusApiClient) {
        this.busApiClient = busApiClient;

        this.GenerateUacs = this.GenerateUacs.bind(this);
        this.GetUacsByCaseId = this.GetUacsByCaseId.bind(this);
        this.GetUacCount = this.GetUacCount.bind(this);
    }

    async GenerateUacs(req: Request, res: Response): Promise<Response> {
        const { instrumentName } = req.params;
        const uacCodes = await this.busApiClient.generateUacCodesForInstrument(instrumentName);

        if (typeof uacCodes !== "object") {
            req.log.error(`Generate UAC codes for ${instrumentName} response is not an object`);
            return res.status(500).json();
        }

        req.log.info(`Generate UAC codes for ${instrumentName} response successful`);
        return res.status(200).json(uacCodes);
    }

    async GetUacsByCaseId(req: Request, res: Response): Promise<Response> {
        const { instrumentName } = req.params;
        const uacCodes = await this.busApiClient.getUacCodesByCaseId(instrumentName);

        if (typeof uacCodes !== "object") {
            req.log.error(`Get UAC codes by caseID for ${instrumentName} response is not an object`);
            return res.status(500).json();
        }

        req.log.info(`Get UAC codes by case ID for ${instrumentName} response successful`);
        return res.status(200).json(uacCodes);
    }

    async GetUacCount(req: Request, res: Response): Promise<Response> {
        const { instrumentName } = req.params;
        const uacCount = await this.busApiClient.getUacCodeCount(instrumentName);

        if (typeof uacCount.count !== "number") {
            req.log.error(`Get UAC code for ${instrumentName} response is not a number`);
            return res.status(500).json();
        }

        req.log.info(`Get UAC code count for ${instrumentName} response successful, count: ${uacCount.count}`);
        return res.status(200).json(uacCount);
    }
}
