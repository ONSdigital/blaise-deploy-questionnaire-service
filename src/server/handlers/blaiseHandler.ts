import {
  type BlaiseApiClient,
  type InstallQuestionnaire,
  type Questionnaire,
} from "blaise-api-node-client";
import { type Auth } from "blaise-login-react-server";
import express, { type Request, type Response, type Router } from "express";

import { fieldPeriodToText } from "../functions.js";
import { sanitise } from "../helpers/sanitise.js";

import type AuditLogger from "../auditLogger.js";

export default function newBlaiseHandler(
  blaiseApiClient: BlaiseApiClient,
  serverPark: string,
  auth: Auth,
  auditLogger: AuditLogger,
): Router {
  const router = express.Router();

  const blaiseHandler = new BlaiseHandler(blaiseApiClient, serverPark, auth, auditLogger);

  router.get("/api/questionnaires", auth.Middleware, blaiseHandler.getQuestionnaires);
  router.get(
    "/api/questionnaires/:questionnaireName",
    auth.Middleware,
    blaiseHandler.getQuestionnaire,
  );
  router.get(
    "/api/questionnaires/:questionnaireName/modes",
    auth.Middleware,
    blaiseHandler.getModes,
  );
  router.get(
    "/api/questionnaires/:questionnaireName/modes/:mode",
    auth.Middleware,
    blaiseHandler.doesQuestionnaireHaveMode,
  );
  router.get(
    "/api/questionnaires/:questionnaireName/settings",
    auth.Middleware,
    blaiseHandler.getSettings,
  );
  router.get(
    "/api/questionnaires/:questionnaireName/surveydays",
    auth.Middleware,
    blaiseHandler.getSurveyDays,
  );
  router.get(
    "/api/questionnaires/:questionnaireName/active",
    auth.Middleware,
    blaiseHandler.getActiveSurveyDays,
  );
  router.get(
    "/api/questionnaires/:questionnaireName/cases/ids",
    auth.Middleware,
    blaiseHandler.getCases,
  );
  router.post("/api/install", auth.Middleware, blaiseHandler.installQuestionnaire);
  router.patch(
    "/api/questionnaires/:questionnaireName/activate",
    auth.Middleware,
    blaiseHandler.activateQuestionnaire,
  );
  router.patch(
    "/api/questionnaires/:questionnaireName/deactivate",
    auth.Middleware,
    blaiseHandler.deactivateQuestionnaire,
  );
  router.delete(
    "/api/questionnaires/:questionnaireName",
    auth.Middleware,
    blaiseHandler.deleteQuestionnaire,
  );

  return router;
}

class BlaiseHandler {
  blaiseApiClient: BlaiseApiClient;
  serverPark: string;
  auth: Auth;
  auditLogger: AuditLogger;

  constructor(
    blaiseApiClient: BlaiseApiClient,
    serverPark: string,
    auth: Auth,
    auditLogger: AuditLogger,
  ) {
    this.blaiseApiClient = blaiseApiClient;
    this.serverPark = serverPark;
    this.auth = auth;
    this.auditLogger = auditLogger;
  }

  getQuestionnaire = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const safeQuestionnaireName = sanitise(questionnaireName);

    try {
      const questionnaire = await this.blaiseApiClient.getQuestionnaire(
        this.serverPark,
        questionnaireName,
      );

      req.log.info(
        { questionnaireName: safeQuestionnaireName },
        "Get questionnaire endpoint succeeded",
      );

      return res.status(200).json(questionnaire);
    } catch (error: unknown) {
      if (this.errorNotFound(error)) {
        return res.status(404).json();
      }

      req.log.error({ error }, "Get questionnaire endpoint failed");

      return res.status(500).json();
    }
  };

  installQuestionnaire = async (req: Request, res: Response): Promise<Response> => {
    const filename: string = req.body.filename;
    const questionnaireName = sanitise(filename?.toString().replace(/\.[a-zA-Z]*$/, "") ?? "");
    const username = sanitise(this.auth.GetUser(this.auth.GetToken(req)).name);
    const installQuestionnaire: InstallQuestionnaire = {
      questionnaireFile: filename?.toString() || "",
    };

    try {
      const response = await this.blaiseApiClient.installQuestionnaire(
        this.serverPark,
        installQuestionnaire,
      );

      this.auditLogger.info(req.log, `${username} deployed questionnaire ${questionnaireName}`);

      return res.status(201).json(response);
    } catch (error: unknown) {
      req.log.error({ error }, "Install questionnaire endpoint failed");
      this.auditLogger.error(
        req.log,
        `${username} failed to install questionnaire ${questionnaireName}`,
      );

      return res.status(500).json();
    }
  };

  deleteQuestionnaire = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const safeQuestionnaireName = sanitise(questionnaireName);
    const username = sanitise(this.auth.GetUser(this.auth.GetToken(req)).name);

    try {
      const response = await this.blaiseApiClient.deleteQuestionnaire(
        this.serverPark,
        questionnaireName,
      );

      this.auditLogger.info(req.log, `${username} deleted questionnaire ${safeQuestionnaireName}`);

      return res.status(204).json(response);
    } catch (error: unknown) {
      if (this.errorNotFound(error)) {
        this.auditLogger.error(
          req.log,
          `${username} attempted to uninstall questionnaire ${safeQuestionnaireName} but it doesn't exist by`,
        );

        return res.status(404).json();
      }

      this.auditLogger.error(
        req.log,
        `${username} failed to uninstall questionnaire ${safeQuestionnaireName}`,
      );

      return res.status(500).json();
    }
  };

  activateQuestionnaire = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const safeQuestionnaireName = sanitise(questionnaireName);
    const username = sanitise(this.auth.GetUser(this.auth.GetToken(req)).name);

    try {
      const response = await this.blaiseApiClient.activateQuestionnaire(
        this.serverPark,
        questionnaireName,
      );

      this.auditLogger.info(
        req.log,
        `${username} activated questionnaire ${safeQuestionnaireName}`,
      );

      return res.status(204).json(response);
    } catch (error: unknown) {
      if (this.errorNotFound(error)) {
        this.auditLogger.error(
          req.log,
          `${username} attempted to activate questionnaire ${safeQuestionnaireName} but it doesn't exist`,
        );

        return res.status(404).json();
      }

      this.auditLogger.error(
        req.log,
        `${username} failed to activate questionnaire ${safeQuestionnaireName}`,
      );

      return res.status(500).json();
    }
  };

  deactivateQuestionnaire = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const safeQuestionnaireName = sanitise(questionnaireName);
    const username = sanitise(this.auth.GetUser(this.auth.GetToken(req)).name);

    try {
      const response = await this.blaiseApiClient.deactivateQuestionnaire(
        this.serverPark,
        questionnaireName,
      );

      this.auditLogger.info(
        req.log,
        `${username} deactivated questionnaire ${safeQuestionnaireName}`,
      );

      return res.status(204).json(response);
    } catch (error: unknown) {
      if (this.errorNotFound(error)) {
        this.auditLogger.error(
          req.log,
          `${username} attempted to deactivate questionnaire ${safeQuestionnaireName} but it doesn't exist`,
        );

        return res.status(404).json();
      }

      this.auditLogger.error(
        req.log,
        `${username} failed to deactivate questionnaire ${safeQuestionnaireName}`,
      );

      return res.status(500).json();
    }
  };

  doesQuestionnaireHaveMode = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName, mode } = req.params as { questionnaireName: string; mode: string };
    const safeQuestionnaireName = sanitise(questionnaireName);
    const safeMode = sanitise(mode);

    try {
      const response = await this.blaiseApiClient.doesQuestionnaireHaveMode(
        this.serverPark,
        questionnaireName,
        mode,
      );

      req.log.info(
        { questionnaireName: safeQuestionnaireName, mode: safeMode, hasMode: response },
        "Does questionnaire have mode endpoint succeeded",
      );

      return res.status(200).json(response);
    } catch (error: unknown) {
      req.log.error(
        { error },
        `Does questionnaire have mode endpoint failed for ${safeQuestionnaireName}`,
      );

      return res.status(500).json();
    }
  };

  getQuestionnaires = async (req: Request, res: Response): Promise<Response> => {
    try {
      const questionnaires: Questionnaire[] = await this.blaiseApiClient.getQuestionnaires(
        this.serverPark,
      );

      questionnaires.forEach((questionnaire: Questionnaire) => {
        if (questionnaire.status === "Erroneous") {
          req.log.warn(
            { questionnaireName: questionnaire.name },
            "Questionnaire returned erroneous status from Blaise",
          );
          questionnaire.status = "Failed";
        }

        questionnaire.fieldPeriod = fieldPeriodToText(questionnaire.name);
      });

      req.log.info(
        { questionnairesCount: questionnaires.length },
        "Get questionnaires endpoint succeeded",
      );

      return res.status(200).json(questionnaires);
    } catch (error: unknown) {
      req.log.error({ error }, "Get questionnaires endpoint failed.");

      return res.status(500).json();
    }
  };

  getCases = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const safeQuestionnaireName = sanitise(questionnaireName);

    try {
      const caseIds = await this.blaiseApiClient.getQuestionnaireCaseIds(
        this.serverPark,
        questionnaireName,
      );

      req.log.info(
        { questionnaireName: safeQuestionnaireName, caseCount: caseIds.length },
        "Get questionnaire case IDs endpoint succeeded",
      );

      return res.status(200).json(caseIds);
    } catch (error: unknown) {
      req.log.error(
        { error },
        `Get questionnaire case IDs endpoint failed for ${safeQuestionnaireName}`,
      );

      return res.status(500).json();
    }
  };

  getModes = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const safeQuestionnaireName = sanitise(questionnaireName);

    try {
      const modes = await this.blaiseApiClient.getQuestionnaireModes(
        this.serverPark,
        questionnaireName,
      );

      req.log.info(
        { questionnaireName: safeQuestionnaireName, modesCount: modes.length },
        "Get questionnaire modes endpoint succeeded",
      );

      return res.status(200).json(modes);
    } catch (error: unknown) {
      req.log.error(
        { error },
        `Get questionnaire modes endpoint failed for ${safeQuestionnaireName}`,
      );

      return res.status(500).json(null);
    }
  };

  getSettings = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const safeQuestionnaireName = sanitise(questionnaireName);

    try {
      const questionnaireSettings = await this.blaiseApiClient.getQuestionnaireSettings(
        this.serverPark,
        questionnaireName,
      );

      req.log.info(
        { questionnaireName: safeQuestionnaireName, settingsCount: questionnaireSettings.length },
        "Get questionnaire settings endpoint succeeded",
      );

      return res.status(200).json(questionnaireSettings);
    } catch (error: unknown) {
      req.log.error(
        { error },
        `Get questionnaire settings endpoint failed for ${safeQuestionnaireName}`,
      );

      return res.status(500).json();
    }
  };

  getSurveyDays = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const safeQuestionnaireName = sanitise(questionnaireName);

    try {
      const surveyDays = await this.blaiseApiClient.getSurveyDays(
        this.serverPark,
        questionnaireName,
      );

      req.log.info(
        { questionnaireName: safeQuestionnaireName, surveyDaysCount: surveyDays.length },
        "Get survey days endpoint succeeded",
      );

      return res.status(200).json(surveyDays);
    } catch (error: unknown) {
      req.log.error({ error }, `Get survey days endpoint failed for ${safeQuestionnaireName}`);

      return res.status(500).json(null);
    }
  };

  getActiveSurveyDays = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const safeQuestionnaireName = sanitise(questionnaireName);

    try {
      const surveyDays: string[] = await this.blaiseApiClient.getSurveyDays(
        this.serverPark,
        questionnaireName,
      );
      const hasActiveSurveyDays = Array.isArray(surveyDays) && surveyDays.length > 0;

      req.log.info(
        { questionnaireName: safeQuestionnaireName, hasActiveSurveyDays },
        "Get active survey days endpoint succeeded",
      );

      return res.status(200).json(hasActiveSurveyDays);
    } catch (error: unknown) {
      req.log.error(
        { error },
        `Get active survey days endpoint failed for ${safeQuestionnaireName}`,
      );

      return res.status(500).json();
    }
  };

  private errorNotFound(error: unknown): boolean {
    if (typeof error !== "object" || error === null) {
      return false;
    }

    if (!("isAxiosError" in error) || !("response" in error)) {
      return false;
    }

    const axiosError = error as { isAxiosError?: boolean; response?: { status?: number } };

    return axiosError.isAxiosError === true && axiosError.response?.status === 404;
  }
}
