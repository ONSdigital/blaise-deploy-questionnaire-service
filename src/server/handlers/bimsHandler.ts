import { type Auth } from "blaise-login-react-server";
import dateFormatter from "dayjs";
import express, { type Request, type Response, type Router } from "express";

import { type BimsClient, type TmReleaseDate, type ToStartDate } from "../bimsClient.js";
import { getUsername } from "../helpers/getUsername.js";
import { isRecord } from "../helpers/isRecord.js";
import { sanitise } from "../helpers/sanitise.js";

import type AuditLogger from "../auditLogger.js";

const SUPPORTED_DATE_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}(?:.{1}[0-9]{2}:[0-9]{2}:[0-9]{2})?/;

export default function newBimsHandler(
  bimsClient: BimsClient,
  auth: Auth,
  auditLogger: AuditLogger,
): Router {
  const router = express.Router();

  const bimsHandler = new BimsHandler(bimsClient, auditLogger, auth);

  router.post("/api/tostartdate/:questionnaireName", auth.middleware, bimsHandler.setToStartDate);
  router.delete(
    "/api/tostartdate/:questionnaireName",
    auth.middleware,
    bimsHandler.deleteToStartDate,
  );
  router.get("/api/tostartdate/:questionnaireName", auth.middleware, bimsHandler.getToStartDate);

  router.post(
    "/api/tmreleasedate/:questionnaireName",
    auth.middleware,
    bimsHandler.setTmReleaseDate,
  );
  router.delete(
    "/api/tmreleasedate/:questionnaireName",
    auth.middleware,
    bimsHandler.deleteTmReleaseDate,
  );
  router.get(
    "/api/tmreleasedate/:questionnaireName",
    auth.middleware,
    bimsHandler.getTmReleaseDate,
  );

  return router;
}

class BimsHandler {
  private readonly bimsClient: BimsClient;
  private readonly auditLogger: AuditLogger;
  private readonly auth: Auth;

  constructor(bimsClient: BimsClient, auditLogger: AuditLogger, auth: Auth) {
    this.bimsClient = bimsClient;
    this.auditLogger = auditLogger;
    this.auth = auth;
  }

  setToStartDate = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const safeQuestionnaireName = sanitise(questionnaireName);
    const username = getUsername(req, this.auth);
    const requestedToStartDate = readRequestedDate(req.body, "tostartdate");

    if (requestedToStartDate === undefined) {
      // Changed: reject malformed date payloads at the boundary so bad input never reaches BIMS.
      req.log.warn(
        { questionnaireName: safeQuestionnaireName },
        "Rejected invalid Telephone Operations start date payload",
      );

      return res.status(400).json({ message: "Invalid tostartdate" });
    }

    try {
      let toStartDate = await this.bimsClient.getToStartDate(questionnaireName);

      if (!toStartDateExists(toStartDate) && requestedToStartDate === "") {
        req.log.info(
          `No previous Telephone Operations start date found and none specified for questionnaire ${safeQuestionnaireName}`,
        );

        return res.status(201).json("");
      }

      if (toStartDateExists(toStartDate) && requestedToStartDate === "") {
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
        requestedToStartDate,
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
    const username = getUsername(req, this.auth);

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
    const username = getUsername(req, this.auth);
    const requestedTmReleaseDate = readRequestedDate(req.body, "tmreleasedate");

    if (requestedTmReleaseDate === undefined) {
      // Changed: reject malformed date payloads at the boundary so bad input never reaches BIMS.
      req.log.warn(
        { questionnaireName: safeQuestionnaireName },
        "Rejected invalid Totalmobile release date payload",
      );

      return res.status(400).json({ message: "Invalid tmreleasedate" });
    }

    try {
      const previousTmReleaseDate = await this.bimsClient.getTmReleaseDate(questionnaireName);

      if (!tmReleaseDateExists(previousTmReleaseDate) && requestedTmReleaseDate === "") {
        req.log.info(
          `No previous Totalmobile release date found and none specified for questionnaire ${safeQuestionnaireName}`,
        );

        return res.status(201).json("");
      }

      if (tmReleaseDateExists(previousTmReleaseDate) && requestedTmReleaseDate === "") {
        const previousDateStr = ` (previously ${dateFormatter(previousTmReleaseDate.tmreleasedate).format("YYYY-MM-DD")})`;

        try {
          await this.bimsClient.deleteTmReleaseDate(questionnaireName);
          this.auditLogger.info(
            req.log,
            `${username} deleted ${safeQuestionnaireName} Totalmobile release date${previousDateStr}`,
          );
        } catch (error: unknown) {
          this.auditLogger.error(
            req.log,
            `${username} failed to delete ${safeQuestionnaireName} Totalmobile release date${previousDateStr}`,
          );
          throw error;
        }

        return res.status(201).json("");
      }

      const tmReleaseDate = await this.upsertTmReleaseDate(
        questionnaireName,
        previousTmReleaseDate,
        requestedTmReleaseDate,
        username,
        req,
      );

      return res.status(201).json(tmReleaseDate);
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

  private async upsertTmReleaseDate(
    questionnaireName: string,
    previousTmReleaseDate: TmReleaseDate | undefined,
    newTmReleaseDate: string,
    username: string,
    req: Request,
  ): Promise<TmReleaseDate> {
    const safeQuestionnaireName = sanitise(questionnaireName);
    const safeNewTmReleaseDate = sanitise(newTmReleaseDate);

    try {
      let configuredTmReleaseDate: TmReleaseDate;

      if (tmReleaseDateExists(previousTmReleaseDate)) {
        const previousDateStr = ` (previously ${dateFormatter(previousTmReleaseDate.tmreleasedate).format("YYYY-MM-DD")})`;

        configuredTmReleaseDate = await this.bimsClient.updateTmReleaseDate(
          questionnaireName,
          newTmReleaseDate,
        );
        this.auditLogger.info(
          req.log,
          `${username} updated ${safeQuestionnaireName} Totalmobile release date to ${safeNewTmReleaseDate}${previousDateStr}`,
        );
      } else {
        configuredTmReleaseDate = await this.bimsClient.createTmReleaseDate(
          questionnaireName,
          newTmReleaseDate,
        );
        this.auditLogger.info(
          req.log,
          `${username} set ${safeQuestionnaireName} Totalmobile release date to ${safeNewTmReleaseDate}`,
        );
      }

      return configuredTmReleaseDate;
    } catch (error: unknown) {
      const previousDateStr = tmReleaseDateExists(previousTmReleaseDate)
        ? ` (previously ${dateFormatter(previousTmReleaseDate.tmreleasedate).format("YYYY-MM-DD")})`
        : "";
      const verb = tmReleaseDateExists(previousTmReleaseDate) ? "update" : "set";

      this.auditLogger.error(
        req.log,
        `${username} failed to ${verb} ${safeQuestionnaireName} Totalmobile release date to ${safeNewTmReleaseDate}${previousDateStr}`,
      );
      throw error;
    }
  }

  deleteTmReleaseDate = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const safeQuestionnaireName = sanitise(questionnaireName);
    const username = getUsername(req, this.auth);

    try {
      const tmReleaseDate = await this.bimsClient.getTmReleaseDate(questionnaireName);

      if (!tmReleaseDateExists(tmReleaseDate)) {
        return res.status(204).json();
      }

      await this.bimsClient.deleteTmReleaseDate(questionnaireName);

      const previousDateStr = ` (previously ${dateFormatter(tmReleaseDate.tmreleasedate).format("YYYY-MM-DD")})`;

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

  return isSupportedDateValue(toStartDate.tostartdate);
}

function tmReleaseDateExists(
  tmReleaseDate: TmReleaseDate | undefined,
): tmReleaseDate is TmReleaseDate {
  if (!tmReleaseDate) {
    return false;
  }

  return isSupportedDateValue(tmReleaseDate.tmreleasedate);
}

function readRequestedDate(
  body: unknown,
  fieldName: "tostartdate" | "tmreleasedate",
): string | undefined {
  if (!isRecord(body)) {
    return undefined;
  }

  const value = body[fieldName];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (trimmedValue === "") {
    return "";
  }

  return isSupportedDateValue(trimmedValue) ? trimmedValue : undefined;
}

function isSupportedDateValue(value: string): boolean {
  return SUPPORTED_DATE_PATTERN.test(value);
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
