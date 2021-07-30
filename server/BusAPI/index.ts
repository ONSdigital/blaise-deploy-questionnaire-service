import {EnvironmentVariables} from "../Config";
import express, {Request, Response, Router} from "express";
import {BusAPI} from "./BusAPI";

export default function BusAPIRouter(environmentVariables: EnvironmentVariables, logger: any): Router {
    const {BUS_API_URL, BUS_CLIENT_ID}: EnvironmentVariables = environmentVariables;
    const router = express.Router();

    const bimsAPI = new BusAPI(BUS_API_URL, BUS_CLIENT_ID, logger);

    router.post("/api/uacs/instrument/:instrumentName", async function (req: Request, res: Response) {
        const {instrumentName} = req.params;
        const [status, result, contentType] = await bimsAPI.generateUACsForInstrument(req, res, instrumentName);

        if (status === 200 && contentType !== "application/json") {
            req.log.warn("Response was not JSON, most likely invalid auth");
            res.status(400).json({});
            return;
        }

        res.status(status).json(result);
    });

    router.get("/api/uacs/instrument/:instrumentName/count", async function (req: Request, res: Response) {
        const {instrumentName} = req.params;
        const [status, result, contentType] = await bimsAPI.getCountOfUACsForInstrument(req, res, instrumentName);
        req.log.warn(`contentType is ${contentType}`);
        if (status === 200 && contentType !== "application/json") {
            req.log.warn("Response was not JSON, most likely invalid auth");
            res.status(400).json({});
            return;
        }

        res.status(status).json(result);
    });

    return router;
}
