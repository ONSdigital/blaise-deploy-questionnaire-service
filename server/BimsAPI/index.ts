import {EnvironmentVariables} from "../Config";
import express, {Request, Response, Router} from "express";
import {auditLogError, auditLogInfo} from "../audit_logging";
import {BimsAPI} from "./BimsAPI";

export default function BimsAPIRouter(environmentVariables: EnvironmentVariables, logger: any): Router {
    const {BIMS_API_URL, BIMS_CLIENT_ID}: EnvironmentVariables = environmentVariables;
    const router = express.Router();

    const bimsAPI = new BimsAPI(BIMS_API_URL, BIMS_CLIENT_ID, logger);

    router.post("/api/tostartdate/:instrumentName", async function (req: Request, res: Response) {
        const {instrumentName} = req.params;
        const data = req.body;

        let [status, result, contentType] = await bimsAPI.getStartDate(req, res, instrumentName);

        const startDateExists = (status === 200 && result.tostartdate.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}.{1}[0-9]{2}:[0-9]{2}:[0-9]{2}/) !== null);

        if (!startDateExists && data.tostartdate === "") {
            req.log.info(`No previous TO start date found and none specified for questionnaire ${instrumentName}`);
            res.status(200).json("");
            return;
        }

        if (startDateExists && data.tostartdate === "") {
            const [status, result] = await bimsAPI.deleteStartDate(req, res, instrumentName);

            if (status === 204) {
                auditLogInfo(req.log, `Successfully removed TO start date for questionnaire ${instrumentName}`);
                res.status(200).json(result);
            } else {
                auditLogError(req.log, `Failed to remove TO start date for questionnaire ${instrumentName}`);
                res.status(500).json(result);
            }

            return;
        }

        if (startDateExists) {
            [status, result, contentType] = await bimsAPI.updateStartDate(req, res, instrumentName, data);
        } else {
            [status, result, contentType] = await bimsAPI.createStartDate(req, res, instrumentName, data);
        }

        if (status === 200 || status === 201) {
            auditLogInfo(req.log, `Successfully set TO start date to ${data.tostartdate} for questionnaire ${instrumentName}`);
        } else {
            auditLogError(req.log, `Failed to set TO start date to ${data.tostartdate} for questionnaire ${instrumentName}`);
        }

        // If status is successful but contentType is not application/json
        if (status >= 200 && status < 300 && contentType !== "application/json") {
            req.log.warn("Response was not JSON, most likely invalid auth");
            res.status(400).json([]);
            return;
        }

        res.status(status).json(result);
    });

    router.delete("/api/tostartdate/:instrumentName", async function (req: Request, res: Response) {
        const {instrumentName} = req.params;

        let [status, result] = await bimsAPI.getStartDate(req, res, instrumentName);
        const startDateExists = (status === 200 && result.tostartdate.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}/) !== null);
        if (!startDateExists) {
            res.status(204).json(result);
            return;
        }

        [status, result] = await bimsAPI.deleteStartDate(req, res, instrumentName);

        if (status === 204) {
            auditLogInfo(req.log, `Successfully removed TO start date for questionnaire ${instrumentName}`);
            res.status(204).json(result);
        } else {
            auditLogError(req.log, `Failed to remove TO start date for questionnaire ${instrumentName}`);
            res.status(status).json(result);
        }
    });

    router.get("/api/tostartdate/:instrumentName", async function (req: Request, res: Response) {
        const {instrumentName} = req.params;

        const [status, result, contentType] = await bimsAPI.getStartDate(req, res, instrumentName);

        if (status === 200 && contentType !== "application/json") {
            req.log.warn("Response was not JSON, most likely invalid auth");
            res.status(400).json({});
            return;
        }

        res.status(status).json(result);
    });

    return router;
}
