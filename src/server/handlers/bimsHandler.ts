import express, { Request, Response, Router } from "express";
import { Auth } from "blaise-login-react-server";
import {BimsApi, tmReleaseDate, toStartDate} from "../bimsApi/bimsApi";
import AuditLogger from "../auditLogging/logger";
import dateFormatter from "dayjs";
import {release} from "os";

export default function newBimsHandler(bimsApiClient: BimsApi, auth: Auth, auditLogger: AuditLogger): Router {
  const router = express.Router();

  const bimsHandler = new BimsHandler(bimsApiClient, auditLogger);
  // TO start date
  router.post("/api/tostartdate/:questionnaireName", auth.Middleware, bimsHandler.SetToStartDate);
  router.delete("/api/tostartdate/:questionnaireName", auth.Middleware, bimsHandler.DeleteToStartDate);
  router.get("/api/tostartdate/:questionnaireName", auth.Middleware, bimsHandler.GetToStartDate);

  // TM release date
  router.post("/api/tmreleasedate/:questionnaireName", auth.Middleware, bimsHandler.SetTmReleaseDate);
  router.delete("/api/tmreleasedate/:questionnaireName", auth.Middleware, bimsHandler.DeleteTmReleaseDate);
  router.get("/api/tmreleasedate/:questionnaireName", auth.Middleware, bimsHandler.GetTmReleaseDate);

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

    this.SetTmReleaseDate = this.SetTmReleaseDate.bind(this);
    this.DeleteTmReleaseDate = this.DeleteTmReleaseDate.bind(this);
    this.GetTmReleaseDate = this.GetTmReleaseDate.bind(this);
  }

  async SetToStartDate(req: Request, res: Response): Promise<Response> {
    const { questionnaireName } = req.params;
    const reqData = req.body;
    try {
      let startDate = await this.bimsApiClient.getStartDate(questionnaireName);

      if (!startDateExists(startDate) && reqData.tostartdate === "") {
        req.log.info(`No previous TO start date found and none specified for questionnaire ${questionnaireName}`);
        return res.status(201).json("");
      }

      if (startDateExists(startDate) && reqData.tostartdate === "") {
        try {
          await this.bimsApiClient.deleteStartDate(questionnaireName);
          this.auditLogger.info(req.log, `Successfully removed TO start date for questionnaire ${questionnaireName}`);
          return res.status(201).json();
        } catch (error: unknown) {
          this.auditLogger.error(req.log, `Failed to remove TO start date for questionnaire ${questionnaireName}`);
          throw error;
        }
      }

      startDate = await this.setToStartDate(questionnaireName, startDate, reqData.tostartdate, req);
      return res.status(201).json(startDate);
    } catch {
      return res.status(500).json();
    }
  }

  async DeleteToStartDate(req: Request, res: Response): Promise<Response> {
    const { questionnaireName } = req.params;

    try {
      const startDate = await this.bimsApiClient.getStartDate(questionnaireName);

      if (!startDateExists(startDate)) {
        return res.status(204).json();
      }

      await this.bimsApiClient.deleteStartDate(questionnaireName);

      this.auditLogger.info(req.log, `Successfully removed TO start date for questionnaire ${questionnaireName}`);
      return res.status(204).json();
    } catch (error: unknown) {
      console.error(error);
      this.auditLogger.error(req.log, `Failed to remove TO start date for questionnaire ${questionnaireName}`);
      return res.status(500).json();
    }
  }

  async GetToStartDate(req: Request, res: Response): Promise<Response> {
    const { questionnaireName } = req.params;

    try {
      const startDate = await this.bimsApiClient.getStartDate(questionnaireName);
      if (!startDate) {
        return res.status(404).json();
      }
      return res.status(200).json(await this.bimsApiClient.getStartDate(questionnaireName));
    } catch {
      return res.status(500).json({});
    }
  }

  async setToStartDate(questionnaireName: string, startDate: toStartDate | undefined, newStartDate: string, req: Request): Promise<toStartDate> {
    try {
      let configuredToStartDate: toStartDate;
      if (startDateExists(startDate)) {
        configuredToStartDate = await this.bimsApiClient.updateStartDate(questionnaireName, newStartDate);
      } else {
        configuredToStartDate = await this.bimsApiClient.createStartDate(questionnaireName, newStartDate);
      }
      this.auditLogger.info(req.log, `Successfully set TO start date to ${newStartDate} for questionnaire ${questionnaireName}`);
      return configuredToStartDate;
    } catch (error: unknown) {
      this.auditLogger.error(req.log, `Failed to set TO start date to ${newStartDate} for questionnaire ${questionnaireName}`);
      throw error;
    }
  }

  async SetTmReleaseDate(req: Request, res: Response): Promise<Response> {
    const { questionnaireName } = req.params;
    const reqData = req.body;
    try {
      let releaseDate = await this.bimsApiClient.getReleaseDate(questionnaireName);

      if (!releaseDateExists(releaseDate) && reqData.tmreleasedate === "") {
        this.auditLogger.info(req.log, `No Totalmobile release date set for ${questionnaireName}`);
        return res.status(201).json("");
      }

      if (releaseDateExists(releaseDate) && reqData.tmreleasedate === "") {
        try {
          const previousReleaseDate = dateFormatter(releaseDate?.tmreleasedate).format("YYYY-MM-DD");
          await this.bimsApiClient.deleteReleaseDate(questionnaireName);
          this.auditLogger.info(req.log, `Totalmobile release date removed for ${questionnaireName}. Previously ${previousReleaseDate}`);
          return res.status(201).json();
        } catch (error: unknown) {
          this.auditLogger.error(req.log, `Failed to remove TM release date for questionnaire ${questionnaireName}`);
          throw error;
        }
      }

      releaseDate = await this.setTmReleaseDate(questionnaireName, releaseDate, reqData.tmreleasedate, req);
      return res.status(201).json(releaseDate);
    } catch {
      return res.status(500).json();
    }
  }

  async DeleteTmReleaseDate(req: Request, res: Response): Promise<Response> {
    const { questionnaireName } = req.params;

    try {
      const releaseDate = await this.bimsApiClient.getReleaseDate(questionnaireName);
      const previousReleaseDate = dateFormatter(releaseDate?.tmreleasedate).format("YYYY-MM-DD");

      if (!releaseDateExists(releaseDate)) {
        return res.status(204).json();
      }

      await this.bimsApiClient.deleteReleaseDate(questionnaireName);

      this.auditLogger.info(req.log, `Totalmobile release date removed for ${questionnaireName}. Previously ${previousReleaseDate}`);
      return res.status(204).json();
    } catch (error: unknown) {
      console.error(error);
      this.auditLogger.error(req.log, `Failed to remove TM release date for questionnaire ${questionnaireName}`);
      return res.status(500).json();
    }
  }

  async GetTmReleaseDate(req: Request, res: Response): Promise<Response> {
    const { questionnaireName } = req.params;

    try {
      const releaseDate = await this.bimsApiClient.getReleaseDate(questionnaireName);
      if (!releaseDate) {
        return res.status(404).json();
      }
      return res.status(200).json(await this.bimsApiClient.getReleaseDate(questionnaireName));
    } catch {
      return res.status(500).json({});
    }
  }

  async setTmReleaseDate(questionnaireName: string, releaseDate: tmReleaseDate | undefined, newReleaseDate: string, req: Request): Promise<tmReleaseDate> {
    try {
      let configuredTmReleaseDate: tmReleaseDate;
      if (releaseDateExists(releaseDate)) {
        const previousReleaseDate = dateFormatter(releaseDate?.tmreleasedate).format("YYYY-MM-DD");

        configuredTmReleaseDate = await this.bimsApiClient.updateReleaseDate(questionnaireName, newReleaseDate);
        this.auditLogger.info(req.log,
            `Totalmobile release date updated to ${newReleaseDate} for ${questionnaireName}. Previously ${previousReleaseDate}`);
      } else {
        configuredTmReleaseDate = await this.bimsApiClient.createReleaseDate(questionnaireName, newReleaseDate);
        this.auditLogger.info(req.log, `Totalmobile release date set to ${newReleaseDate} for ${questionnaireName}`);
      }
      return configuredTmReleaseDate;
    } catch (error: unknown) {
      this.auditLogger.error(req.log, `Failed to set TM release date to ${newReleaseDate} for questionnaire ${questionnaireName}`);
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

function releaseDateExists(releaseDate: tmReleaseDate | undefined): boolean {
  if (!releaseDate) {
    return false;
  }
  const regexp = new RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}(.{1}[0-9]{2}:[0-9]{2}:[0-9]{2})?/);
  return regexp.test(releaseDate.tmreleasedate);
}
