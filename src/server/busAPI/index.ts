import { EnvironmentVariables } from "../config";
import express, { NextFunction, Request, Response, Router } from "express";
import BusApiClient from "bus-api-node-client";
import { Auth } from "blaise-login-react-server";

export default function BusAPIRouter(environmentVariables: EnvironmentVariables, logger: any, auth: Auth): Router {
    const { BusApiUrl, BusClientId }: EnvironmentVariables = environmentVariables;
    const router = express.Router();

    const busApiClient = new BusApiClient(BusApiUrl, BusClientId);

    // Handle Errors from async functions.
    const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
        return (req: Request, res: Response, next: NextFunction) => {
            fn(req, res, next).catch(next);
        };
    };

    router.post("/api/uacs/instrument/:instrumentName", auth.Middleware, catchAsync(async function (req: Request, res: Response) {
        const { instrumentName } = req.params;
        const uacCodes = await busApiClient.generateUacCodesForInstrument(instrumentName);

        if (typeof uacCodes !== "object") {
            req.log.error(`Generate UAC codes for ${instrumentName} response is not an object`);
            res.status(500).json();
            return;
        }

        req.log.info(`Generate UAC codes for ${instrumentName} response successful`);
        res.status(200).json(uacCodes);
    }));

    router.get("/api/uacs/instrument/:instrumentName/bycaseid", auth.Middleware, catchAsync(async function (req: Request, res: Response) {
        const { instrumentName } = req.params;
        const uacCodes = await busApiClient.getUacCodesByCaseId(instrumentName);

        if (typeof uacCodes !== "object") {
            req.log.error(`Get UAC codes by caseID for ${instrumentName} response is not an object`);
            res.status(500).json();
            return;
        }

        req.log.info(`Get UAC codes by case ID for ${instrumentName} response successful`);
        res.status(200).json(uacCodes);
    }));

    router.get("/api/uacs/instrument/:instrumentName/count", auth.Middleware, catchAsync(async function (req: Request, res: Response) {
        const { instrumentName } = req.params;
        const uacCount = await busApiClient.getUacCodeCount(instrumentName);

        if (typeof uacCount.count !== "number") {
            req.log.error(`Get UAC code for ${instrumentName} response is not a number`);
            res.status(500).json();
            return;
        }

        req.log.info(`Get UAC code count for ${instrumentName} response successful, count: ${uacCount.count}`);
        res.status(200).json(uacCount);
    }));

    router.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
        logger(req, res);
        req.log.error({ err, next }, `${err.message}. Request: ${req.url} ${req.method}`);
        res.status(500).json();
    });

    return router;
}
