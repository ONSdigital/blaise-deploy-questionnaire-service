import {EnvironmentVariables} from "../Config";
import express, {NextFunction, Request, Response, Router} from "express";
import BusApiClient from "bus-api-node-client";

export default function BusAPIRouter(environmentVariables: EnvironmentVariables, logger: any): Router {
    const {BUS_API_URL, BUS_CLIENT_ID}: EnvironmentVariables = environmentVariables;
    const router = express.Router();

    const busApiClient = new BusApiClient(BUS_API_URL, BUS_CLIENT_ID);

    // Handle Errors from async functions.
    const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
        return (req: Request, res: Response, next: NextFunction) => {
            fn(req, res, next).catch(next);
        };
    };

    router.post("/api/uacs/instrument/:instrumentName", catchAsync(async function (req: Request, res: Response) {
        const {instrumentName} = req.params;
        const uacCodes = await busApiClient.generateUacCodesForInstrument(instrumentName);

        if (typeof uacCodes !== "object") {
            req.log.error(`Generate UAC codes for ${instrumentName} response is not an object`);
            res.status(500).json();
            return;
        }

        res.status(200).json(uacCodes);
    }));

    router.get("/api/uacs/instrument/:instrumentName/bycaseid", catchAsync(async function (req: Request, res: Response) {
        const {instrumentName} = req.params;
        const uacCodes = await busApiClient.getUacCodesByCaseId(instrumentName);

        if (typeof uacCodes !== "object") {
            req.log.error(`Get UAC codes by caseID for ${instrumentName} response is not an object`);
            res.status(500).json();
            return;
        }

        res.status(200).json(uacCodes);
    }));

    router.get("/api/uacs/instrument/:instrumentName/count", catchAsync(async function (req: Request, res: Response) {
        const {instrumentName} = req.params;
        const uacCount = await busApiClient.getUacCodeCount(instrumentName);

        if (typeof uacCount.count !== "number") {
            req.log.error(`Get UAC code for ${instrumentName} response is not a number`);
            res.status(500).json();
            return;
        }

        req.log.error(`Get UAC code count for ${instrumentName} response successful, count: ${uacCount.count}`);
        res.status(200).json(uacCount);
    }));

    router.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
        logger(req, res);
        req.log.error({err, next}, `${err.message}. Request: ${req.url} ${req.method}`);
        res.status(500).json();
    });

    return router;
}
