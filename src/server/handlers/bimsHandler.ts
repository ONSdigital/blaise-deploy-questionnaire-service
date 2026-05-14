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
      let toStartDate = await this.bimsClient.getToStartDate(questionnaireName);

      if (!toStartDateExists(toStartDate) && reqData.tostartdate === "") {
        req.log.info(
          `No previous Telephone Operations start date found and none specified for questionnaire ${questionnaireName}`,
        );

        return res.status(201).json("");
      }

      if (toStartDateExists(toStartDate) && reqData.tostartdate === "") {
        try {
          await this.bimsClient.deleteToStartDate(questionnaireName);
          this.auditLogger.info(
            req.log,
            `Successfully deleted Telephone Operations start date for questionnaire ${questionnaireName} by ${username}`,
          );

          return res.status(201).json();
        } catch (error: unknown) {
          this.auditLogger.error(
            req.log,
            `Failed to delete Telephone Operations start date for questionnaire ${questionnaireName} by ${username}`,
          );
          throw error;
        }
      }

      toStartDate = await this.upsertToStartDate(
        questionnaireName,
        toStartDate,
        reqData.tostartdate,
        username,
        req,
      );

      return res.status(201).json(toStartDate);
    } catch {
      return res.status(500).json();
    }
  };

  deleteToStartDate = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const username = this.auth.GetUser(this.auth.GetToken(req)).name;

    try {
      const toStartDate = await this.bimsClient.getToStartDate(questionnaireName);

      if (!toStartDateExists(toStartDate)) {
        return res.status(204).json();
      }

      await this.bimsClient.deleteToStartDate(questionnaireName);

      this.auditLogger.info(
        req.log,
        `Successfully deleted Telephone Operations start date for questionnaire ${questionnaireName} by ${username}`,
      );

      return res.status(204).json();
    } catch (error: unknown) {
      req.log.error(
        error,
        `Failed to delete Telephone Operations start date for questionnaire ${questionnaireName}`,
      );
      this.auditLogger.error(
        req.log,
        `Failed to delete Telephone Operations start date for questionnaire ${questionnaireName} by ${username}`,
      );

      return res.status(500).json();
    }
  };

  getToStartDate = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };

    try {
      const toStartDate = await this.bimsClient.getToStartDate(questionnaireName);

      if (!toStartDate) {
        return res.status(404).json();
      }

      return res.status(200).json(toStartDate);
    } catch {
      return res.status(500).json({});
    }
  };

  private async upsertToStartDate(
    questionnaireName: string,
    toStartDate: ToStartDate | undefined,
    newToStartDate: string,
    username: string,
    req: Request,
  ): Promise<ToStartDate> {
    try {
      let configuredToStartDate: ToStartDate;

      if (toStartDateExists(toStartDate)) {
        configuredToStartDate = await this.bimsClient.updateToStartDate(
          questionnaireName,
          newToStartDate,
        );
      } else {
        configuredToStartDate = await this.bimsClient.createToStartDate(
          questionnaireName,
          newToStartDate,
        );
      }

      this.auditLogger.info(
        req.log,
        `Successfully set Telephone Operations start date to ${newToStartDate} for questionnaire ${questionnaireName} by ${username}`,
      );

      return configuredToStartDate;
    } catch (error: unknown) {
      this.auditLogger.error(
        req.log,
        `Failed to set Telephone Operations start date to ${newToStartDate} for questionnaire ${questionnaireName} by ${username}`,
      );
      throw error;
    }
  }

  setTmReleaseDate = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const username = this.auth.GetUser(this.auth.GetToken(req)).name;

    try {
      const previousTmReleaseDate = await this.bimsClient.getTmReleaseDate(questionnaireName);
      const newTmReleaseDate = req.body.tmreleasedate;
      const newTmReleaseDateIsEmpty = newTmReleaseDate === "";

      if (!tmReleaseDateExists(previousTmReleaseDate) && newTmReleaseDateIsEmpty) {
        this.auditLogger.info(req.log, `No release date set for ${questionnaireName}`);

        return res.status(201).json("");
      }

      let responseBody: TmReleaseDate | "";

      if (tmReleaseDateExists(previousTmReleaseDate) && newTmReleaseDateIsEmpty) {
        await this.bimsClient.deleteTmReleaseDate(questionnaireName);
        const previousDateStr = ` (previously ${dateFormatter(previousTmReleaseDate!.tmreleasedate).format("YYYY-MM-DD")})`;

        this.auditLogger.info(
          req.log,
          `Totalmobile release date deleted${previousDateStr} for ${questionnaireName} by ${username}`,
        );
        responseBody = "";
      } else if (tmReleaseDateExists(previousTmReleaseDate)) {
        responseBody = await this.bimsClient.updateTmReleaseDate(
          questionnaireName,
          newTmReleaseDate,
        );
        const previousDateStr = ` (previously ${dateFormatter(previousTmReleaseDate!.tmreleasedate).format("YYYY-MM-DD")})`;

        this.auditLogger.info(
          req.log,
          `Totalmobile release date updated to ${newTmReleaseDate}${previousDateStr} for ${questionnaireName} by ${username}`,
        );
      } else {
        responseBody = await this.bimsClient.createTmReleaseDate(
          questionnaireName,
          newTmReleaseDate,
        );
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
      const tmReleaseDate = await this.bimsClient.getTmReleaseDate(questionnaireName);

      if (!tmReleaseDateExists(tmReleaseDate)) {
        return res.status(204).json();
      }

      await this.bimsClient.deleteTmReleaseDate(questionnaireName);

      const previousDateStr = ` (previously ${dateFormatter(tmReleaseDate!.tmreleasedate).format("YYYY-MM-DD")})`;

      this.auditLogger.info(
        req.log,
        `Totalmobile release date deleted${previousDateStr} for ${questionnaireName} by ${username}`,
      );

      return res.status(204).json();
    } catch (error: unknown) {
      req.log.error(
        error,
        `Failed to delete Totalmobile release date for questionnaire ${questionnaireName}`,
      );
      this.auditLogger.error(
        req.log,
        `Failed to delete Totalmobile release date for questionnaire ${questionnaireName} by ${username}`,
      );

      return res.status(500).json();
    }
  };

  getTmReleaseDate = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };

    try {
      const tmReleaseDate = await this.bimsClient.getTmReleaseDate(questionnaireName);

      if (!tmReleaseDate) {
        return res.status(404).json();
      }

      return res.status(200).json(tmReleaseDate);
    } catch {
      return res.status(500).json({});
    }
  };
}

function toStartDateExists(toStartDate: ToStartDate | undefined): boolean {
  if (!toStartDate) {
    return false;
  }

  const regexp = new RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}(.{1}[0-9]{2}:[0-9]{2}:[0-9]{2})?/);

  return regexp.test(toStartDate.tostartdate);
}

function tmReleaseDateExists(tmReleaseDate: TmReleaseDate | undefined): boolean {
  if (!tmReleaseDate) {
    return false;
  }

  const regexp = new RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}(.{1}[0-9]{2}:[0-9]{2}:[0-9]{2})?/);

  return regexp.test(tmReleaseDate.tmreleasedate);
}
