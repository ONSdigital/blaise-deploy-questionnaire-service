import express, {Request, Response, Router} from "express";
import Functions from "../Functions";
import {EnvironmentVariables} from "../Config";
import {auditLogError, auditLogInfo} from "../audit_logging";
import BlaiseApiRest, {InstallInstrument, Instrument} from "blaise-api-node-client";

export default function BlaiseAPIRouter(environmentVariables: EnvironmentVariables, logger: any): Router {
    const {BLAISE_API_URL, SERVER_PARK}: EnvironmentVariables = environmentVariables;
    const router = express.Router();

    interface ResponseQuery extends Request {
        query: { filename: string };
    }

    // Get health status for Blaise connections
    router.get("/api/health/diagnosis", function (req: ResponseQuery, res: Response) {
        const blaiseApiClient = new BlaiseApiRest(`http://${BLAISE_API_URL}`);
        blaiseApiClient.getDiagnostics()
            .then((response) => {
                req.log.info({response}, "Successfully called health check endpoint");
                res.status(200).json(response);
            })
            .catch((error) => {
                req.log.error(error, "health check endpoint failed");
                res.status(500).json(null);
            });
    });

    // Call to install a specific instrument from a specified GCP bucket and file
    router.get("/api/install", function (req: ResponseQuery, res: Response) {
        const {filename} = req.query;
        const instrumentName = filename.replace(/\.[a-zA-Z]*$/, "");
        const installInstrument: InstallInstrument = {
            "instrumentFile": filename
        };
        const blaiseApiClient = new BlaiseApiRest(`http://${BLAISE_API_URL}`);
        blaiseApiClient.installInstrument(SERVER_PARK, installInstrument)
            .then((response) => {
                auditLogInfo(req.log, `Successfully installed questionnaire ${instrumentName}`);
                res.status(201).json(response);
            })
            .catch((error) => {
                req.log.error(error, "Install instrument endpoint failed");
                auditLogError(req.log, `Failed to install questionnaire ${instrumentName}`);
                res.status(500).json(null);
            });
    });

    // Get a specific instrument information
    router.get("/api/instruments/:instrumentName", async function (req: ResponseQuery, res: Response) {
        const {instrumentName} = req.params;
        const blaiseApiClient = new BlaiseApiRest(`http://${BLAISE_API_URL}`);
        const instrumentExists = await blaiseApiClient.instrumentExists(SERVER_PARK, instrumentName);

        if (!instrumentExists) {
            res.status(404).json(null);
            return;
        }

        if (instrumentExists) {
            auditLogInfo(req.log, `Attempting to install existing questionnaire ${instrumentName}`);
            blaiseApiClient.getInstrumentWithCatiData(SERVER_PARK, instrumentName)
                .then((response) => {
                    req.log.info({response}, `Get instrument with CATI data ${instrumentName} endpoint`);
                    res.status(200).json(response);
                })
                .catch((error) => {
                    req.log.error(error, "Get instrument with CATI data endpoint failed");
                    res.status(500).json(null);
                });
        }
    });

    // Delete an instrument
    router.delete("/api/instruments/:instrumentName", function (req: ResponseQuery, res: Response) {
        const {instrumentName} = req.params;
        const blaiseApiClient = new BlaiseApiRest(`http://${BLAISE_API_URL}`);

        blaiseApiClient.deleteInstrument(SERVER_PARK, instrumentName)
            .then((response) => {
                auditLogInfo(req.log, `Successfully uninstalled questionnaire ${instrumentName}`);
                res.status(204).json(response);
            })
            .catch((error) => {
                if (error.status === 404) {
                    auditLogError(req.log, `Attempted to uninstall questionnaire ${instrumentName} that doesn't exist`);
                    res.status(404).json(null);
                } else {
                    auditLogError(req.log, `Failed to uninstall questionnaire ${instrumentName}`);
                    res.status(500).json(null);
                }
            });
    });

    // Check if instrument has a mode
    router.get("/api/instruments/:instrumentName/modes/:mode", function (req: ResponseQuery, res: Response) {
        const {instrumentName, mode} = req.params;
        const blaiseApiClient = new BlaiseApiRest(`http://${BLAISE_API_URL}`);
        blaiseApiClient.doesInstrumentHaveMode(SERVER_PARK, instrumentName, mode)
            .then((response) => {
                req.log.info({response}, `Successfully called does instrument have mode endpoint for ${instrumentName}`);
                res.status(200).json(response);
            })
            .catch((error) => {
                req.log.error(error, `does instrument have mode failed for ${instrumentName}`);
                res.status(500).json(null);
            });
    });

    // Get list of all instruments installed in a specified server park
    router.get("/api/instruments", function (req: ResponseQuery, res: Response) {
        logger(req, res);
        const blaiseApiClient = new BlaiseApiRest(`http://${BLAISE_API_URL}`);

        blaiseApiClient.getInstrumentsWithCatiData(SERVER_PARK)
            .then((response) => {
                const instruments: Instrument[] = response;
                instruments.forEach(function (element: Instrument) {
                    element.fieldPeriod = Functions.field_period_to_text(element.name);
                });

                req.log.info({instruments}, `${instruments.length} instrument/s currently installed.`);
                res.status(200).json(instruments);
            })
            .catch((error) => {
                req.log.error(error, "Get instruments endpoint failed");
                res.status(500).json(null);
            });
    });

    // Get list of case ids for installed instrument
    router.get("/api/instruments/:instrumentName/cases/ids", function (req: ResponseQuery, res: Response) {
        const {instrumentName} = req.params;
        logger(req, res);
        const blaiseApiClient = new BlaiseApiRest(`http://${BLAISE_API_URL}`);

        blaiseApiClient.getInstrumentCaseIds(SERVER_PARK, instrumentName)
            .then((response) => {
                req.log.info({response}, `Successfully called get cases IDs for instrument ${instrumentName}`);
                res.status(200).json(response);
            })
            .catch((error) => {
                req.log.error(error, `Get cases IDs for instrument ${instrumentName}`);
                res.status(500).json(null);
            });
    });

    return router;
}

