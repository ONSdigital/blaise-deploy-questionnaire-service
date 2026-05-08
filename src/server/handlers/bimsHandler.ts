import { type IncomingMessage } from "http";

import { type Auth } from "blaise-login-react-server";
import express, { type Request, type Response, type Router } from "express";

import { type BimsApi, type TmReleaseDate, type ToStartDate } from "../bimsApi/bimsApi.js";
import { type Logger } from "../bimsApi/logger.js";
import LoggingReleaseDateManager from "../bimsApi/loggingReleaseDateManager.js";
import { type ReleaseDateManager } from "../bimsApi/releaseDateManager.js";

import type AuditLogger from "../auditLogging/logger.js";

export default function newBimsHandler(
  bimsApiClient: BimsApi,
  auth: Auth,
  auditLogger: AuditLogger,
): Router {
  const router = express.Router();

  const bimsHandler = new BimsHandler(bimsApiClient, auditLogger, auth);

  // TO start date
  router.post("/api/tostartdate/:questionnaireName", auth.Middleware, bimsHandler.SetToStartDate);
  router.delete(
    "/api/tostartdate/:questionnaireName",
    auth.Middleware,
    bimsHandler.DeleteToStartDate,
  );
  router.get("/api/tostartdate/:questionnaireName", auth.Middleware, bimsHandler.GetToStartDate);

  // TM release date
  router.post(
    "/api/tmreleasedate/:questionnaireName",
    auth.Middleware,
    bimsHandler.SetTmReleaseDate,
  );
  router.delete(
    "/api/tmreleasedate/:questionnaireName",
    auth.Middleware,
    bimsHandler.DeleteTmReleaseDate,
  );
  router.get(
    "/api/tmreleasedate/:questionnaireName",
    auth.Middleware,
    bimsHandler.GetTmReleaseDate,
  );

  return router;
}

class BimsHandler {
  bimsApiClient: BimsApi;
  auditLogger: AuditLogger;
  auth: Auth;

  constructor(bimsApiClient: BimsApi, auditLogger: AuditLogger, auth: Auth) {
    this.bimsApiClient = bimsApiClient;
    this.auditLogger = auditLogger;
    this.auth = auth;

    this.SetToStartDate = this.SetToStartDate.bind(this);
    this.DeleteToStartDate = this.DeleteToStartDate.bind(this);
    this.GetToStartDate = this.GetToStartDate.bind(this);

    this.SetTmReleaseDate = this.SetTmReleaseDate.bind(this);
    this.DeleteTmReleaseDate = this.DeleteTmReleaseDate.bind(this);
    this.GetTmReleaseDate = this.GetTmReleaseDate.bind(this);
  }

  async SetToStartDate(req: Request, res: Response): Promise<Response> {
    // CHANGED: Cast req.params to enforce strict string type
    const { questionnaireName } = req.params as { questionnaireName: string };
    const reqData = req.body;

    try {
      let startDate = await this.bimsApiClient.getStartDate(questionnaireName);

      if (!startDateExists(startDate) && reqData.tostartdate === "") {
        req.log.info(
          `No previous TO start date found and none specified for questionnaire ${questionnaireName}`,
        );

        return res.status(201).json("");
      }

      if (startDateExists(startDate) && reqData.tostartdate === "") {
        try {
          await this.bimsApiClient.deleteStartDate(questionnaireName);
          this.auditLogger.info(
            req.log,
            `Successfully removed TO start date for questionnaire ${questionnaireName}`,
          );

          return res.status(201).json();
        } catch (error: unknown) {
          this.auditLogger.error(
            req.log,
            `Failed to remove TO start date for questionnaire ${questionnaireName}`,
          );
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
    // CHANGED: Cast req.params to enforce strict string type
    const { questionnaireName } = req.params as { questionnaireName: string };

    try {
      const startDate = await this.bimsApiClient.getStartDate(questionnaireName);

      if (!startDateExists(startDate)) {
        return res.status(204).json();
      }

      await this.bimsApiClient.deleteStartDate(questionnaireName);

      this.auditLogger.info(
        req.log,
        `Successfully removed TO start date for questionnaire ${questionnaireName}`,
      );

      return res.status(204).json();
    } catch (error: unknown) {
      console.error(error);
      this.auditLogger.error(
        req.log,
        `Failed to remove TO start date for questionnaire ${questionnaireName}`,
      );

      return res.status(500).json();
    }
  }

  async GetToStartDate(req: Request, res: Response): Promise<Response> {
    // CHANGED: Cast req.params to enforce strict string type
    const { questionnaireName } = req.params as { questionnaireName: string };

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

  async setToStartDate(
    questionnaireName: string,
    startDate: ToStartDate | undefined,
    newStartDate: string,
    req: Request,
  ): Promise<ToStartDate> {
    try {
      let configuredToStartDate: ToStartDate;

      if (startDateExists(startDate)) {
        configuredToStartDate = await this.bimsApiClient.updateStartDate(
          questionnaireName,
          newStartDate,
        );
      } else {
        configuredToStartDate = await this.bimsApiClient.createStartDate(
          questionnaireName,
          newStartDate,
        );
      }

      this.auditLogger.info(
        req.log,
        `Successfully set TO start date to ${newStartDate} for questionnaire ${questionnaireName}`,
      );

      return configuredToStartDate;
    } catch (error: unknown) {
      this.auditLogger.error(
        req.log,
        `Failed to set TO start date to ${newStartDate} for questionnaire ${questionnaireName}`,
      );
      throw error;
    }
  }

  async SetTmReleaseDate(req: Request, res: Response): Promise<Response> {
    // CHANGED: Destructured and cast req.params to keep it consistent and enforce strict string type
    const { questionnaireName } = req.params as { questionnaireName: string };

    try {
      const responseBody = await setReleaseDate(
        this.getLoggingBimsApiClient(req),
        questionnaireName, // CHANGED: Using the destructured and typed variable
        req.body.tmreleasedate,
        this.auditLogger,
        req.log,
      );

      return res.status(201).json(responseBody);
    } catch {
      return res.status(500).json();
    }
  }

  async DeleteTmReleaseDate(req: Request, res: Response): Promise<Response> {
    // CHANGED: Cast req.params to enforce strict string type
    const { questionnaireName } = req.params as { questionnaireName: string };

    try {
      const bimsApiClient = this.getLoggingBimsApiClient(req);

      const releaseDate = await bimsApiClient.getReleaseDate(questionnaireName);

      if (!releaseDateExists(releaseDate)) {
        return res.status(204).json();
      }

      await bimsApiClient.deleteReleaseDate(questionnaireName);

      return res.status(204).json();
    } catch (error: unknown) {
      console.error(error);

      return res.status(500).json();
    }
  }

  async GetTmReleaseDate(req: Request, res: Response): Promise<Response> {
    // CHANGED: Cast req.params to enforce strict string type
    const { questionnaireName } = req.params as { questionnaireName: string };

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

  private getLoggingBimsApiClient(req: Request): ReleaseDateManager {
    const logger: Logger = {
      info: (message: string) => this.auditLogger.info(req.log, message),
      error: (message: string) => this.auditLogger.error(req.log, message),
    };

    const username = this.auth.GetUser(this.auth.GetToken(req)).name;

    return new LoggingReleaseDateManager(this.bimsApiClient, logger, username);
  }
}

function startDateExists(startDate: ToStartDate | undefined): boolean {
  if (!startDate) {
    return false;
  }

  const regexp = new RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}(.{1}[0-9]{2}:[0-9]{2}:[0-9]{2})?/);

  return regexp.test(startDate.tostartdate);
}

function releaseDateExists(releaseDate: TmReleaseDate | undefined): boolean {
  if (!releaseDate) {
    return false;
  }

  const regexp = new RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}(.{1}[0-9]{2}:[0-9]{2}:[0-9]{2})?/);

  return regexp.test(releaseDate.tmreleasedate);
}

async function setReleaseDate(
  bimsApiClient: ReleaseDateManager,
  questionnaireName: string,
  newTmReleaseDate: string,
  auditLogger: AuditLogger,
  log: IncomingMessage["log"],
) {
  const newTmReleaseDateIsEmpty = newTmReleaseDate === "";
  const releaseDate = await bimsApiClient.getReleaseDate(questionnaireName);
  const originalDateExists = releaseDateExists(releaseDate);

  if (!originalDateExists && newTmReleaseDateIsEmpty) {
    auditLogger.info(log, `No Totalmobile release date set for ${questionnaireName}`);

    return "";
  }

  if (originalDateExists && newTmReleaseDateIsEmpty) {
    return bimsApiClient.deleteReleaseDate(questionnaireName);
  }

  if (originalDateExists) {
    return bimsApiClient.updateReleaseDate(questionnaireName, newTmReleaseDate);
  } else {
    return bimsApiClient.createReleaseDate(questionnaireName, newTmReleaseDate);
  }
}
