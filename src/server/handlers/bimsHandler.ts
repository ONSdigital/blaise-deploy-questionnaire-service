import { type Auth } from "blaise-login-react-server";
import dateFormatter from "dayjs";
import express, { type Request, type Response, type Router } from "express";

import { type BimsClient, type TmReleaseDate, type ToStartDate } from "../bimsClient.js";
import { sanitise } from "../helpers/sanitise.js";

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
    const safeQuestionnaireName = sanitise(questionnaireName);
    const reqData = req.body;
    const username = sanitise(this.auth.GetUser(this.auth.GetToken(req)).name);

    try {
      let toStartDate = await this.bimsClient.getToStartDate(questionnaireName);

      if (!toStartDateExists(toStartDate) && reqData.tostartdate === "") {
        req.log.info(
          `No previous Telephone Operations start date found and none specified for questionnaire ${safeQuestionnaireName}`,
        );

        return res.status(201).json("");
      }

      if (toStartDateExists(toStartDate) && reqData.tostartdate === "") {
        const previousDateStr = ` (previously ${dateFormatter(toStartDate.tostartdate).format("YYYY-MM-DD")})`;

        try {
          await this.bimsClient.deleteToStartDate(questionnaireName);

          this.auditLogger.info(
            req.log,
            `${username} deleted ${safeQuestionnaireName} Telephone Operations start date${previousDateStr}`,
          );

          return res.status(201).json();
        } catch (error: unknown) {
          this.auditLogger.error(
            req.log,
            `${username} failed to delete ${safeQuestionnaireName} Telephone Operations start date${previousDateStr}`,
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
    const safeQuestionnaireName = sanitise(questionnaireName);
    const username = sanitise(this.auth.GetUser(this.auth.GetToken(req)).name);

    try {
      const toStartDate = await this.bimsClient.getToStartDate(questionnaireName);

      if (!toStartDateExists(toStartDate)) {
        return res.status(204).json();
      }

      await this.bimsClient.deleteToStartDate(questionnaireName);

      const previousDateStr = ` (previously ${dateFormatter(toStartDate.tostartdate).format("YYYY-MM-DD")})`;

      this.auditLogger.info(
        req.log,
        `${username} deleted ${safeQuestionnaireName} Telephone Operations start date${previousDateStr}`,
      );

      return res.status(204).json();
    } catch (error: unknown) {
      req.log.error(
        {
          error: getSafeErrorMessage(error),
          questionnaireName: safeQuestionnaireName,
        },
        "Failed to delete Telephone Operations start date for questionnaire",
      );
      this.auditLogger.error(
        req.log,
        `${username} failed to delete ${safeQuestionnaireName} Telephone Operations start date`,
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
    const safeQuestionnaireName = sanitise(questionnaireName);
    const safeNewToStartDate = sanitise(newToStartDate);

    try {
      let configuredToStartDate: ToStartDate;

      if (toStartDateExists(toStartDate)) {
        const existingToStartDate = toStartDate;

        configuredToStartDate = await this.bimsClient.updateToStartDate(
          questionnaireName,
          newToStartDate,
        );

        const previousDateStr = ` (previously ${dateFormatter(existingToStartDate.tostartdate).format("YYYY-MM-DD")})`;

        this.auditLogger.info(
          req.log,
          `${username} updated ${safeQuestionnaireName} Telephone Operations start date to ${safeNewToStartDate}${previousDateStr}`,
        );
      } else {
        configuredToStartDate = await this.bimsClient.createToStartDate(
          questionnaireName,
          newToStartDate,
        );

        this.auditLogger.info(
          req.log,
          `${username} set ${safeQuestionnaireName} Telephone Operations start date to ${safeNewToStartDate}`,
        );
      }

      return configuredToStartDate;
    } catch (error: unknown) {
      const previousDateStr = toStartDateExists(toStartDate)
        ? ` (previously ${dateFormatter(toStartDate.tostartdate).format("YYYY-MM-DD")})`
        : "";

      this.auditLogger.error(
        req.log,
        `${username} failed to set ${safeQuestionnaireName} Telephone Operations start date to ${safeNewToStartDate}${previousDateStr}`,
      );
      throw error;
    }
  }

  setTmReleaseDate = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const safeQuestionnaireName = sanitise(questionnaireName);
    const username = sanitise(this.auth.GetUser(this.auth.GetToken(req)).name);

    try {
      const previousTmReleaseDate = await this.bimsClient.getTmReleaseDate(questionnaireName);
      const newTmReleaseDate = req.body.tmreleasedate;
      const safeNewTmReleaseDate = sanitise(String(newTmReleaseDate));
      const newTmReleaseDateIsEmpty = newTmReleaseDate === "";

      if (!tmReleaseDateExists(previousTmReleaseDate) && newTmReleaseDateIsEmpty) {
        req.log.info(
          `No previous Totalmobile release date found and none specified for questionnaire ${safeQuestionnaireName}`,
        );

        return res.status(201).json("");
      }

      let responseBody: TmReleaseDate | "";

      if (tmReleaseDateExists(previousTmReleaseDate) && newTmReleaseDateIsEmpty) {
        const previousDateStr = ` (previously ${dateFormatter(previousTmReleaseDate.tmreleasedate).format("YYYY-MM-DD")})`;

        try {
          await this.bimsClient.deleteTmReleaseDate(questionnaireName);
          this.auditLogger.info(
            req.log,
            `${username} deleted ${safeQuestionnaireName} Totalmobile release date${previousDateStr}`,
          );
          responseBody = "";
        } catch (error: unknown) {
          this.auditLogger.error(
            req.log,
            `${username} failed to delete ${safeQuestionnaireName} Totalmobile release date${previousDateStr}`,
          );
          throw error;
        }
      } else if (tmReleaseDateExists(previousTmReleaseDate)) {
        const previousDateStr = ` (previously ${dateFormatter(previousTmReleaseDate.tmreleasedate).format("YYYY-MM-DD")})`;

        try {
          responseBody = await this.bimsClient.updateTmReleaseDate(
            questionnaireName,
            newTmReleaseDate,
          );
          this.auditLogger.info(
            req.log,
            `${username} updated ${safeQuestionnaireName} Totalmobile release date to ${safeNewTmReleaseDate}${previousDateStr}`,
          );
        } catch (error: unknown) {
          this.auditLogger.error(
            req.log,
            `${username} failed to update ${safeQuestionnaireName} Totalmobile release date to ${safeNewTmReleaseDate}${previousDateStr}`,
          );
          throw error;
        }
      } else {
        try {
          responseBody = await this.bimsClient.createTmReleaseDate(
            questionnaireName,
            newTmReleaseDate,
          );
          this.auditLogger.info(
            req.log,
            `${username} set ${safeQuestionnaireName} Totalmobile release date to ${safeNewTmReleaseDate}`,
          );
        } catch (error: unknown) {
          this.auditLogger.error(
            req.log,
            `${username} failed to set ${safeQuestionnaireName} Totalmobile release date to ${safeNewTmReleaseDate}`,
          );
          throw error;
        }
      }

      return res.status(201).json(responseBody);
    } catch (error: unknown) {
      req.log.error(
        {
          error: getSafeErrorMessage(error),
          questionnaireName: safeQuestionnaireName,
        },
        "Failed to set Totalmobile release date for questionnaire",
      );

      return res.status(500).json();
    }
  };

  deleteTmReleaseDate = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const safeQuestionnaireName = sanitise(questionnaireName);
    const username = sanitise(this.auth.GetUser(this.auth.GetToken(req)).name);

    try {
      const tmReleaseDate = await this.bimsClient.getTmReleaseDate(questionnaireName);

      if (!tmReleaseDateExists(tmReleaseDate)) {
        return res.status(204).json();
      }

      await this.bimsClient.deleteTmReleaseDate(questionnaireName);

      const previousDateStr = ` (previously ${dateFormatter(tmReleaseDate!.tmreleasedate).format("YYYY-MM-DD")})`;

      this.auditLogger.info(
        req.log,
        `${username} deleted ${safeQuestionnaireName} Totalmobile release date${previousDateStr}`,
      );

      return res.status(204).json();
    } catch (error: unknown) {
      req.log.error(
        {
          error: getSafeErrorMessage(error),
          questionnaireName: safeQuestionnaireName,
        },
        "Failed to delete Totalmobile release date for questionnaire",
      );
      this.auditLogger.error(
        req.log,
        `${username} failed to delete ${safeQuestionnaireName} Totalmobile release date`,
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

function toStartDateExists(toStartDate: ToStartDate | undefined): toStartDate is ToStartDate {
  if (!toStartDate) {
    return false;
  }

  const regexp = new RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}(.{1}[0-9]{2}:[0-9]{2}:[0-9]{2})?/);

  return regexp.test(toStartDate.tostartdate);
}

function tmReleaseDateExists(
  tmReleaseDate: TmReleaseDate | undefined,
): tmReleaseDate is TmReleaseDate {
  if (!tmReleaseDate) {
    return false;
  }

  const regexp = new RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}(.{1}[0-9]{2}:[0-9]{2}:[0-9]{2})?/);

  return regexp.test(tmReleaseDate.tmreleasedate);
}

function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return sanitise(`${error.name}: ${error.message}`);
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const errorMessage = error.message;

    if (typeof errorMessage === "string") {
      return sanitise(errorMessage);
    }
  }

  return sanitise(String(error));
}
