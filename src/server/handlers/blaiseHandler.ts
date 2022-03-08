import express, { Request, Response, Router } from "express";
import { Auth } from "blaise-login-react-server";
import BlaiseApiClient, { InstallInstrument, Instrument } from "blaise-api-node-client";
import { fieldPeriodToText } from "../functions";
import AuditLogger from "../auditLogging/logger";

export default function NewBlaiseHandler(blaiseApiClient: BlaiseApiClient, serverPark: string, auth: Auth, auditLogger: AuditLogger): Router {
  const router = express.Router();

  const blaiseHandler = new BlaiseHandler(blaiseApiClient, serverPark, auditLogger);

  router.get("/api/health/diagnosis", auth.Middleware, blaiseHandler.GetHealth);
  router.get("/api/instruments", auth.Middleware, blaiseHandler.GetInstruments);
  router.get("/api/instruments/:instrumentName", auth.Middleware, blaiseHandler.GetInstrument);
  router.get("/api/instruments/:instrumentName/modes", auth.Middleware, blaiseHandler.GetModes);
  router.get("/api/instruments/:instrumentName/modes/:mode", auth.Middleware, blaiseHandler.DoesInstrumentHaveMode);
  router.get("/api/instruments/:instrumentName/settings", auth.Middleware, blaiseHandler.GetSettings);
  router.get("/api/instruments/:instrumentName/cases/ids", auth.Middleware, blaiseHandler.GetCases);
  router.post("/api/install", auth.Middleware, blaiseHandler.InstallInstrument);
  router.patch("/api/instruments/:instrumentName/activate", auth.Middleware, blaiseHandler.ActivateInstrument);
  router.patch("/api/instruments/:instrumentName/deactivate", auth.Middleware, blaiseHandler.DeactivateInstrument);
  router.delete("/api/instruments/:instrumentName", auth.Middleware, blaiseHandler.DeleteInstrument);

  return router;
}

export class BlaiseHandler {
  blaiseApiClient: BlaiseApiClient;
  serverPark: string;
  auditLogger: AuditLogger;

  constructor(blaiseApiClient: BlaiseApiClient, serverPark: string, auditLogger: AuditLogger) {
    this.blaiseApiClient = blaiseApiClient;
    this.serverPark = serverPark;
    this.auditLogger = auditLogger;

    this.GetHealth = this.GetHealth.bind(this);
    this.GetInstrument = this.GetInstrument.bind(this);
    this.InstallInstrument = this.InstallInstrument.bind(this);
    this.DeleteInstrument = this.DeleteInstrument.bind(this);
    this.ActivateInstrument = this.ActivateInstrument.bind(this);
    this.DeactivateInstrument = this.DeactivateInstrument.bind(this);
    this.DoesInstrumentHaveMode = this.DoesInstrumentHaveMode.bind(this);
    this.GetInstruments = this.GetInstruments.bind(this);
    this.GetCases = this.GetCases.bind(this);
    this.GetModes = this.GetModes.bind(this);
    this.GetSettings = this.GetSettings.bind(this);
  }

  async GetHealth(req: Request, res: Response): Promise<Response> {
    try {
      const diagnostics = await this.blaiseApiClient.getDiagnostics();
      req.log.info({ diagnostics }, "Successfully called health check endpoint");
      return res.status(200).json(diagnostics);
    } catch (error: any) {
      req.log.error(error, "health check endpoint failed");
      return res.status(500).json();
    }
  }

  async GetInstrument(req: Request, res: Response): Promise<Response> {
    const { instrumentName } = req.params;

    try {
      const instrument = await this.blaiseApiClient.getInstrument(this.serverPark, instrumentName);
      req.log.info({ instrument }, `Get instrument ${instrumentName} endpoint`);
      return res.status(200).json(instrument);
    } catch (error: any) {
      if (this.errorNotFound(error)) {
        return res.status(404).json();
      }
      console.log(error);
      req.log.error(error, "Get instrument endpoint failed");
      return res.status(500).json();
    }
  }

  async InstallInstrument(req: Request, res: Response): Promise<Response> {
    const filename: string = req.body.filename;
    const instrumentName = filename?.toString().replace(/\.[a-zA-Z]*$/, "");
    const installInstrument: InstallInstrument = {
      instrumentFile: filename?.toString() || ""
    };
    try {
      const response = await this.blaiseApiClient.installInstrument(this.serverPark, installInstrument);
      this.auditLogger.info(req.log, `Successfully installed questionnaire ${instrumentName}`);
      return res.status(201).json(response);
    } catch (error: any) {
      req.log.error(error, "Install instrument endpoint failed");
      this.auditLogger.error(req.log, `Failed to install questionnaire ${instrumentName}`);
      return res.status(500).json();
    }
  }

  async DeleteInstrument(req: Request, res: Response): Promise<Response> {
    const { instrumentName } = req.params;

    try {
      const response = await this.blaiseApiClient.deleteInstrument(this.serverPark, instrumentName);
      this.auditLogger.info(req.log, `Successfully uninstalled questionnaire ${instrumentName}`);
      return res.status(204).json(response);
    } catch (error: any) {
      if (this.errorNotFound(error)) {
        this.auditLogger.error(req.log, `Attempted to uninstall questionnaire ${instrumentName} that doesn't exist`);
        return res.status(404).json();
      }
      this.auditLogger.error(req.log, `Failed to uninstall questionnaire ${instrumentName}`);
      return res.status(500).json();
    }
  }

  async ActivateInstrument(req: Request, res: Response): Promise<Response> {
    const { instrumentName } = req.params;

    try {
      const response = await this.blaiseApiClient.activateInstrument(this.serverPark, instrumentName);
      this.auditLogger.info(req.log, `Successfully activated questionnaire ${instrumentName}`);
      return res.status(204).json(response);
    } catch (error: any) {
      if (this.errorNotFound(error)) {
        this.auditLogger.error(req.log, `Attempted to activate questionnaire ${instrumentName} that doesn't exist`);
        return res.status(404).json();
      }
      this.auditLogger.error(req.log, `Failed to activate questionnaire ${instrumentName}`);
      return res.status(500).json();
    }
  }

  async DeactivateInstrument(req: Request, res: Response): Promise<Response> {
    const { instrumentName } = req.params;

    try {
      const response = await this.blaiseApiClient.deactivateInstrument(this.serverPark, instrumentName);
      this.auditLogger.info(req.log, `Successfully deactivated questionnaire ${instrumentName}`);
      return res.status(204).json(response);
    } catch (error: any) {
      if (this.errorNotFound(error)) {
        this.auditLogger.error(req.log, `Attempted to deactivate questionnaire ${instrumentName} that doesn't exist`);
        return res.status(404).json();
      }
      this.auditLogger.error(req.log, `Failed to deactivate questionnaire ${instrumentName}`);
      return res.status(500).json();
    }
  }

  async DoesInstrumentHaveMode(req: Request, res: Response): Promise<Response> {
    const { instrumentName, mode } = req.params;

    try {
      const response = await this.blaiseApiClient.doesInstrumentHaveMode(this.serverPark, instrumentName, mode);
      req.log.info({ response }, `Successfully called does instrument have mode endpoint for ${instrumentName}`);
      return res.status(200).json(response);
    } catch (error: any) {
      req.log.error(error, `does instrument have mode failed for ${instrumentName}`);
      return res.status(500).json();
    }
  }

  async GetInstruments(req: Request, res: Response): Promise<Response> {
    try {
      const instruments: Instrument[] = await this.blaiseApiClient.getInstruments(this.serverPark);
      instruments.forEach(function (instrument: Instrument) {
        instrument.fieldPeriod = fieldPeriodToText(instrument.name);
      });

      req.log.info({ instruments }, `${instruments.length} instrument/s currently installed.`);
      return res.status(200).json(instruments);
    } catch (error: any) {
      req.log.error(error, "Get instruments endpoint failed");
      return res.status(500).json();
    }
  }

  async GetCases(req: Request, res: Response): Promise<Response> {
    const { instrumentName } = req.params;

    try {
      const caseIds = await this.blaiseApiClient.getInstrumentCaseIds(this.serverPark, instrumentName);
      req.log.info({ caseIds }, `Successfully called get cases IDs for instrument ${instrumentName}`);
      return res.status(200).json(caseIds);
    } catch (error: any) {
      req.log.error(error, `Get cases IDs for instrument ${instrumentName}`);
      return res.status(500).json();
    }
  }

  async GetModes(req: Request, res: Response): Promise<Response> {
    const { instrumentName } = req.params;

    try {
      const modes = await this.blaiseApiClient.getInstrumentModes(this.serverPark, instrumentName);
      req.log.info({ modes }, `Successfully called get instrument modes for ${instrumentName}`);
      return res.status(200).json(modes);
    } catch (error: any) {
      req.log.error(error, `Get instrument modes for ${instrumentName}`);
      return res.status(500).json(null);
    }
  }

  async GetSettings(req: Request, res: Response): Promise<Response> {
    const { instrumentName } = req.params;

    try {
      const instrumentSettings = await this.blaiseApiClient.getInstrumentSettings(this.serverPark, instrumentName);
      req.log.info({ instrumentSettings }, `Successfully called get instrument settings for ${instrumentName}`);
      return res.status(200).json(instrumentSettings);
    } catch (error: any) {
      req.log.error(error, `Get instrument settings for ${instrumentName}`);
      return res.status(500).json();
    }
  }

  errorNotFound(error: any): boolean {
    return (error?.isAxiosError && error.response.status === 404);
  }
}
