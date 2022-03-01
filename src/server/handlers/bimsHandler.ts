import express, { Request, Response, Router } from "express";
import { Auth } from "blaise-login-react-server";
import { BimsApi, toStartDate } from "../bimsApi/bimsApi";
import AuditLogger from "../auditLogging/logger";

export default function newBimsHandler(bimsApiClient: BimsApi, auth: Auth, auditLogger: AuditLogger): Router {
  const router = express.Router();

  const bimsHandler = new BimsHandler(bimsApiClient, auditLogger);
  router.post("/api/tostartdate/:instrumentName", auth.Middleware, bimsHandler.SetToStartDate);
  router.delete("/api/tostartdate/:instrumentName", auth.Middleware, bimsHandler.DeleteToStartDate);
  router.get("/api/tostartdate/:instrumentName", auth.Middleware, bimsHandler.GetToStartDate);
  return router;
}

export class BimsHandler {
  bimsApiClient: BimsApi;
  auditLogger: AuditLogger;

  constructor(bimsApiClient: BimsApi, auditLogger: AuditLogger) {
    this.bimsApiClient = bimsApiClient;
    this.auditLogger = auditLogger;

    this.SetToStartDate = this.SetToStartDate.bind(this);
    this.DeleteToStartDate = this.DeleteToStartDate.bind(this);
    this.GetToStartDate = this.GetToStartDate.bind(this);
  }

  async SetToStartDate(req: Request, res: Response): Promise<Response> {
    const { instrumentName } = req.params;
    const reqData = req.body;
    try {
      let startDate = await this.bimsApiClient.getStartDate(instrumentName);

      if (!startDateExists(startDate) && reqData.tostartdate === "") {
        req.log.info(`No previous TO start date found and none specified for questionnaire ${instrumentName}`);
        return res.status(201).json("");
      }

      if (startDateExists(startDate) && reqData.tostartdate === "") {
        try {
          await this.bimsApiClient.deleteStartDate(instrumentName);
          this.auditLogger.info(req.log, `Successfully removed TO start date for questionnaire ${instrumentName}`);
          return res.status(201).json();
        } catch (error: unknown) {
          this.auditLogger.error(req.log, `Failed to remove TO start date for questionnaire ${instrumentName}`);
          throw error;
        }
      }

      startDate = await this.setToStartDate(instrumentName, startDate, reqData.tostartdate, req);
      return res.status(201).json(startDate);
    } catch {
      return res.status(500).json();
    }
  }

  async DeleteToStartDate(req: Request, res: Response): Promise<Response> {
    const { instrumentName } = req.params;

    try {
      const startDate = await this.bimsApiClient.getStartDate(instrumentName);

      if (!startDateExists(startDate)) {
        return res.status(204).json();
      }

      await this.bimsApiClient.deleteStartDate(instrumentName);

      this.auditLogger.info(req.log, `Successfully removed TO start date for questionnaire ${instrumentName}`);
      return res.status(204).json();
    } catch {
      this.auditLogger.error(req.log, `Failed to remove TO start date for questionnaire ${instrumentName}`);
      return res.status(500).json();
    }
  }

  async GetToStartDate(req: Request, res: Response): Promise<Response> {
    const { instrumentName } = req.params;

    try {
      const startDate = await this.bimsApiClient.getStartDate(instrumentName);
      if (!startDate) {
        return res.status(404).json();
      }
      return res.status(200).json(await this.bimsApiClient.getStartDate(instrumentName));
    } catch {
      return res.status(500).json({});
    }
  }

  async setToStartDate(instrumentName: string, startDate: toStartDate | undefined, newStartDate: string, req: Request): Promise<toStartDate> {
    try {
      let configuredToStartDate: toStartDate;
      if (startDateExists(startDate)) {
        configuredToStartDate = await this.bimsApiClient.updateStartDate(instrumentName, newStartDate);
      } else {
        configuredToStartDate = await this.bimsApiClient.createStartDate(instrumentName, newStartDate);
      }
      this.auditLogger.info(req.log, `Successfully set TO start date to ${newStartDate} for questionnaire ${instrumentName}`);
      return configuredToStartDate;
    } catch (error: unknown) {
      this.auditLogger.error(req.log, `Failed to set TO start date to ${newStartDate} for questionnaire ${instrumentName}`);
      throw error;
    }
  }
}

function startDateExists(startDate: toStartDate | undefined): boolean {
  if (!startDate) {
    return false;
  }
  const regexp = new RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}(.{1}[0-9]{2}:[0-9]{2}:[0-9]{2})?/);
  return regexp.test(startDate.tostartdate);
}
