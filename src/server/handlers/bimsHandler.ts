import { type Auth } from "blaise-login-react-server";
import dateFormatter from "dayjs";
import express, { type Request, type Response, type Router } from "express";

import { type BimsClient, type TmReleaseDate, type ToStartDate } from "../bimsClient.js";

import type AuditLogger from "../auditLogger.js";

export default function newBimsHandler(
  bimsClient: BimsClient,
  auth: Auth,
  auditLogger: AuditLogger,
): Router {
  const router = express.Router();

  const bimsHandler = new BimsHandler(bimsClient, auditLogger, auth);

  router.post("/api/tostartdate/:questionnaireName", auth.Middleware, bimsHandler.setToStartDate);
  router.delete(
    "/api/tostartdate/:questionnaireName",
    auth.Middleware,
    bimsHandler.deleteToStartDate,
  );
  router.get("/api/tostartdate/:questionnaireName", auth.Middleware, bimsHandler.getToStartDate);

  router.post(
    "/api/tmreleasedate/:questionnaireName",
    auth.Middleware,
    bimsHandler.setTmReleaseDate,
  );
  router.delete(
    "/api/tmreleasedate/:questionnaireName",
    auth.Middleware,
    bimsHandler.deleteTmReleaseDate,
  );
  router.get(
    "/api/tmreleasedate/:questionnaireName",
    auth.Middleware,
    bimsHandler.getTmReleaseDate,
  );

  return router;
}

class BimsHandler {
  bimsClient: BimsClient;
  auditLogger: AuditLogger;
  auth: Auth;

  constructor(bimsClient: BimsClient, auditLogger: AuditLogger, auth: Auth) {
    this.bimsClient = bimsClient;
    this.auditLogger = auditLogger;
    this.auth = auth;
  }

  setToStartDate = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const reqData = req.body;
    const username = this.auth.GetUser(this.auth.GetToken(req)).name;

    try {
      let startDate = await this.bimsClient.getStartDate(questionnaireName);

      if (!startDateExists(startDate) && reqData.tostartdate === "") {
        req.log.info(
          `No previous TO start date found and none specified for questionnaire ${questionnaireName}`,
        );

        return res.status(201).json("");
      }

      if (startDateExists(startDate) && reqData.tostartdate === "") {
        try {
          await this.bimsClient.deleteStartDate(questionnaireName);
          this.auditLogger.info(
            req.log,
            `Successfully removed TO start date for questionnaire ${questionnaireName} by ${username}`,
          );

          return res.status(201).json();
        } catch (error: unknown) {
          this.auditLogger.error(
            req.log,
            `Failed to remove TO start date for questionnaire ${questionnaireName} by ${username}`,
          );
          throw error;
        }
      }

      startDate = await this.upsertToStartDate(
        questionnaireName,
        startDate,
        reqData.tostartdate,
        username,
        req,
      );

      return res.status(201).json(startDate);
    } catch {
      return res.status(500).json();
    }
  };

  deleteToStartDate = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const username = this.auth.GetUser(this.auth.GetToken(req)).name;

    try {
      const startDate = await this.bimsClient.getStartDate(questionnaireName);

      if (!startDateExists(startDate)) {
        return res.status(204).json();
      }

      await this.bimsClient.deleteStartDate(questionnaireName);

      this.auditLogger.info(
        req.log,
        `Successfully removed TO start date for questionnaire ${questionnaireName} by ${username}`,
      );

      return res.status(204).json();
    } catch (error: unknown) {
      req.log.error(error, `Failed to remove TO start date for questionnaire ${questionnaireName}`);
      this.auditLogger.error(
        req.log,
        `Failed to remove TO start date for questionnaire ${questionnaireName} by ${username}`,
      );

      return res.status(500).json();
    }
  };

  getToStartDate = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };

    try {
      const startDate = await this.bimsClient.getStartDate(questionnaireName);

      if (!startDate) {
        return res.status(404).json();
      }

      return res.status(200).json(startDate);
    } catch {
      return res.status(500).json({});
    }
  };

  private async upsertToStartDate(
    questionnaireName: string,
    startDate: ToStartDate | undefined,
    newStartDate: string,
    username: string,
    req: Request,
  ): Promise<ToStartDate> {
    try {
      let configuredToStartDate: ToStartDate;

      if (startDateExists(startDate)) {
        configuredToStartDate = await this.bimsClient.updateStartDate(
          questionnaireName,
          newStartDate,
        );
      } else {
        configuredToStartDate = await this.bimsClient.createStartDate(
          questionnaireName,
          newStartDate,
        );
      }

      this.auditLogger.info(
        req.log,
        `Successfully set TO start date to ${newStartDate} for questionnaire ${questionnaireName} by ${username}`,
      );

      return configuredToStartDate;
    } catch (error: unknown) {
      this.auditLogger.error(
        req.log,
        `Failed to set TO start date to ${newStartDate} for questionnaire ${questionnaireName} by ${username}`,
      );
      throw error;
    }
  }

  setTmReleaseDate = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const username = this.auth.GetUser(this.auth.GetToken(req)).name;

    try {
      const previousReleaseDate = await this.bimsClient.getReleaseDate(questionnaireName);
      const newTmReleaseDate = req.body.tmreleasedate;
      const newTmReleaseDateIsEmpty = newTmReleaseDate === "";

      if (!releaseDateExists(previousReleaseDate) && newTmReleaseDateIsEmpty) {
        this.auditLogger.info(req.log, `No Totalmobile release date set for ${questionnaireName}`);

        return res.status(201).json("");
      }

      let responseBody: TmReleaseDate | "";

      if (releaseDateExists(previousReleaseDate) && newTmReleaseDateIsEmpty) {
        await this.bimsClient.deleteReleaseDate(questionnaireName);
        const previousDateStr = ` (previously ${dateFormatter(previousReleaseDate!.tmreleasedate).format("YYYY-MM-DD")})`;

        this.auditLogger.info(
          req.log,
          `Totalmobile release date deleted${previousDateStr} for ${questionnaireName} by ${username}`,
        );
        responseBody = "";
      } else if (releaseDateExists(previousReleaseDate)) {
        responseBody = await this.bimsClient.updateReleaseDate(questionnaireName, newTmReleaseDate);
        const previousDateStr = ` (previously ${dateFormatter(previousReleaseDate!.tmreleasedate).format("YYYY-MM-DD")})`;

        this.auditLogger.info(
          req.log,
          `Totalmobile release date updated to ${newTmReleaseDate}${previousDateStr} for ${questionnaireName} by ${username}`,
        );
      } else {
        responseBody = await this.bimsClient.createReleaseDate(questionnaireName, newTmReleaseDate);
        this.auditLogger.info(
          req.log,
          `Totalmobile release date set to ${newTmReleaseDate} for ${questionnaireName} by ${username}`,
        );
      }

      return res.status(201).json(responseBody);
    } catch (error: unknown) {
      req.log.error(
        error,
        `Failed to set Totalmobile release date for questionnaire ${questionnaireName}`,
      );
      this.auditLogger.error(
        req.log,
        `Failed to set Totalmobile release date for questionnaire ${questionnaireName} (user: ${username})`,
      );

      return res.status(500).json();
    }
  };

  deleteTmReleaseDate = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const username = this.auth.GetUser(this.auth.GetToken(req)).name;

    try {
      const releaseDate = await this.bimsClient.getReleaseDate(questionnaireName);

      if (!releaseDateExists(releaseDate)) {
        return res.status(204).json();
      }

      await this.bimsClient.deleteReleaseDate(questionnaireName);

      const previousDateStr = ` (previously ${dateFormatter(releaseDate!.tmreleasedate).format("YYYY-MM-DD")})`;

      this.auditLogger.info(
        req.log,
        `Totalmobile release date deleted${previousDateStr} for ${questionnaireName} by ${username}`,
      );

      return res.status(204).json();
    } catch (error: unknown) {
      req.log.error(
        error,
        `Failed to remove TM release date for questionnaire ${questionnaireName}`,
      );
      this.auditLogger.error(
        req.log,
        `Failed to remove TM release date for questionnaire ${questionnaireName} by ${username}`,
      );

      return res.status(500).json();
    }
  };

  getTmReleaseDate = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };

    try {
      const releaseDate = await this.bimsClient.getReleaseDate(questionnaireName);

      if (!releaseDate) {
        return res.status(404).json();
      }

      return res.status(200).json(releaseDate);
    } catch {
      return res.status(500).json({});
    }
  };
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
