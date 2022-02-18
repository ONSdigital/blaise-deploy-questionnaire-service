import express, { Request, Response, Router } from "express";
import Functions from "../Functions";
import { EnvironmentVariables } from "../Config";
import { auditLogError, auditLogInfo } from "../audit_logging";
import BlaiseApiRest, { InstallInstrument, Instrument } from "blaise-api-node-client";
import { Auth } from "blaise-login-react-server";

export default function BlaiseAPIRouter(environmentVariables: EnvironmentVariables, logger: any, auth: Auth): Router {
    const { BlaiseApiUrl, ServerPark }: EnvironmentVariables = environmentVariables;
    const router = express.Router();

    interface ResponseQuery extends Request {
        query: { filename: string };
    }

    // Get health status for Blaise connections
    router.get("/api/health/diagnosis", auth.Middleware, function (req: ResponseQuery, res: Response) {
        const blaiseApiClient = new BlaiseApiRest(`${BlaiseApiUrl}`);
        blaiseApiClient.getDiagnostics()
            .then((response) => {
                req.log.info({ response }, "Successfully called health check endpoint");
                res.status(200).json(response);
            })
            .catch((error) => {
                req.log.error(error, "health check endpoint failed");
                res.status(500).json(null);
            });
    });

    // Call to install a specific instrument from a specified GCP bucket and file
    router.get("/api/install", auth.Middleware, function (req: ResponseQuery, res: Response) {
        const { filename } = req.query;
        const instrumentName = filename.replace(/\.[a-zA-Z]*$/, "");
        const installInstrument: InstallInstrument = {
            "instrumentFile": filename
        };
        const blaiseApiClient = new BlaiseApiRest(`${BlaiseApiUrl}`);
        blaiseApiClient.installInstrument(ServerPark, installInstrument)
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
    router.get("/api/instruments/:instrumentName", auth.Middleware, async function (req: ResponseQuery, res: Response) {
        const { instrumentName } = req.params;
        const blaiseApiClient = new BlaiseApiRest(`${BlaiseApiUrl}`);
        const instrumentExists = await blaiseApiClient.instrumentExists(ServerPark, instrumentName);

        if (!instrumentExists) {
            res.status(404).json(null);
            return;
        }

        if (instrumentExists) {
            auditLogInfo(req.log, `Attempting to install existing questionnaire ${instrumentName}`);
            blaiseApiClient.getInstrumentWithCatiData(ServerPark, instrumentName)
                .then((response) => {
                    req.log.info({ response }, `Get instrument with CATI data ${instrumentName} endpoint`);
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
        const { instrumentName } = req.params;
        const blaiseApiClient = new BlaiseApiRest(`${BlaiseApiUrl}`);

        blaiseApiClient.deleteInstrument(ServerPark, instrumentName)
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

    // Activate an instrument
    router.patch("/api/instruments/:instrumentName/activate", auth.Middleware, function (req: ResponseQuery, res: Response) {
        const { instrumentName } = req.params;
        const blaiseApiClient = new BlaiseApiRest(`${BlaiseApiUrl}`);

        blaiseApiClient.activateInstrument(ServerPark, instrumentName)
            .then((response) => {
                auditLogInfo(req.log, `Successfully activated questionnaire ${instrumentName}`);
                res.status(204).json(response);
            })
            .catch((error) => {
                if (error.status === 404) {
                    auditLogError(req.log, `Attempted to activate questionnaire ${instrumentName} that doesn't exist`);
                    res.status(404).json(null);
                } else {
                    auditLogError(req.log, `Failed to activate questionnaire ${instrumentName}`);
                    res.status(500).json(null);
                }
            });
    });

    // Deactivate an instrument
    router.patch("/api/instruments/:instrumentName/deactivate", auth.Middleware, function (req: ResponseQuery, res: Response) {
        const { instrumentName } = req.params;
        const blaiseApiClient = new BlaiseApiRest(`${BlaiseApiUrl}`);

        blaiseApiClient.deactivateInstrument(ServerPark, instrumentName)
            .then((response) => {
                auditLogInfo(req.log, `Successfully deactivated questionnaire ${instrumentName}`);
                res.status(204).json(response);
            })
            .catch((error) => {
                if (error.status === 404) {
                    auditLogError(req.log, `Attempted to deactivate questionnaire ${instrumentName} that doesn't exist`);
                    res.status(404).json(null);
                } else {
                    auditLogError(req.log, `Failed to deactivate questionnaire ${instrumentName}`);
                    res.status(500).json(null);
                }
            });
    });

    // Check if instrument has a mode
    router.get("/api/instruments/:instrumentName/modes/:mode", auth.Middleware, function (req: ResponseQuery, res: Response) {
        const { instrumentName, mode } = req.params;
        const blaiseApiClient = new BlaiseApiRest(`${BlaiseApiUrl}`);
        blaiseApiClient.doesInstrumentHaveMode(ServerPark, instrumentName, mode)
            .then((response) => {
                req.log.info({ response }, `Successfully called does instrument have mode endpoint for ${instrumentName}`);
                res.status(200).json(response);
            })
            .catch((error) => {
                req.log.error(error, `does instrument have mode failed for ${instrumentName}`);
                res.status(500).json(null);
            });
    });

    // Get list of all instruments installed in a specified server park
    router.get("/api/instruments", auth.Middleware, function (req: ResponseQuery, res: Response) {
        logger(req, res);
        const blaiseApiClient = new BlaiseApiRest(BlaiseApiUrl);

        blaiseApiClient.getInstrumentsWithCatiData(ServerPark)
            .then((response) => {
                const instruments: Instrument[] = response;
                instruments.forEach(function (element: Instrument) {
                    element.fieldPeriod = Functions.field_period_to_text(element.name);
                });

                req.log.info({ instruments }, `${instruments.length} instrument/s currently installed.`);
                res.status(200).json(instruments);
            })
            .catch((error) => {
                req.log.error(error, "Get instruments endpoint failed");
                res.status(500).json(null);
            });
    });

    // Get list of case ids for installed instrument
    router.get("/api/instruments/:instrumentName/cases/ids", auth.Middleware, function (req: ResponseQuery, res: Response) {
        const { instrumentName } = req.params;
        logger(req, res);
        const blaiseApiClient = new BlaiseApiRest(`${BlaiseApiUrl}`);

        blaiseApiClient.getInstrumentCaseIds(ServerPark, instrumentName)
            .then((response) => {
                req.log.info({ response }, `Successfully called get cases IDs for instrument ${instrumentName}`);
                res.status(200).json(response);
            })
            .catch((error) => {
                req.log.error(error, `Get cases IDs for instrument ${instrumentName}`);
                res.status(500).json(null);
            });
    });

    router.get("/api/instruments/:instrumentName/modes", auth.Middleware, function (req: ResponseQuery, res: Response) {
        const { instrumentName } = req.params;
        logger(req, res);
        const blaiseApiClient = new BlaiseApiRest(`${BlaiseApiUrl}`);

        blaiseApiClient.getInstrumentModes(ServerPark, instrumentName)
            .then((response) => {
                req.log.info({ response }, `Successfully called get instrument modes for ${instrumentName}`);
                res.status(200).json(response);
            })
            .catch((error) => {
                req.log.error(error, `Get instrument modes for ${instrumentName}`);
                res.status(500).json(null);
            });
    });

    router.get("/api/instruments/:instrumentName/settings", auth.Middleware, function (req: ResponseQuery, res: Response) {
        const { instrumentName } = req.params;
        logger(req, res);
        const blaiseApiClient = new BlaiseApiRest(`${BlaiseApiUrl}`);

        blaiseApiClient.getInstrumentSettings(ServerPark, instrumentName)
            .then((response) => {
                req.log.info({ response }, `Successfully called get instrument settings for ${instrumentName}`);
                res.status(200).json(response);
            })
            .catch((error) => {
                req.log.error(error, `Get instrument settings for ${instrumentName}`);
                res.status(500).json(null);
            });
    });

    return router;
}
