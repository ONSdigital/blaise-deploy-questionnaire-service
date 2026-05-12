import {
  type BlaiseApiClient,
  type InstallQuestionnaire,
  type Questionnaire,
} from "blaise-api-node-client";
import { type Auth } from "blaise-login-react-server";
import express, { type Request, type Response, type Router } from "express";

import { fieldPeriodToText } from "../functions.js";

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

    try {
      const questionnaire = await this.blaiseApiClient.getQuestionnaire(
        this.serverPark,
        questionnaireName,
      );

      req.log.info({ questionnaire }, `Get questionnaire ${questionnaireName} endpoint`);

      return res.status(200).json(questionnaire);
    } catch (error: unknown) {
      if (this.errorNotFound(error)) {
        return res.status(404).json();
      }

      req.log.error(error, "Get questionnaire endpoint failed");

      return res.status(500).json();
    }
  };

  installQuestionnaire = async (req: Request, res: Response): Promise<Response> => {
    const filename: string = req.body.filename;
    const questionnaireName = filename?.toString().replace(/\.[a-zA-Z]*$/, "");
    const username = this.auth.GetUser(this.auth.GetToken(req)).name;
    const installQuestionnaire: InstallQuestionnaire = {
      questionnaireFile: filename?.toString() || "",
    };

    try {
      const response = await this.blaiseApiClient.installQuestionnaire(
        this.serverPark,
        installQuestionnaire,
      );

      this.auditLogger.info(
        req.log,
        `Successfully installed questionnaire ${questionnaireName} by ${username}`,
      );

      return res.status(201).json(response);
    } catch (error: unknown) {
      req.log.error(error, "Install questionnaire endpoint failed");
      this.auditLogger.error(
        req.log,
        `Failed to install questionnaire ${questionnaireName} by ${username}`,
      );

      return res.status(500).json();
    }
  };

  deleteQuestionnaire = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };
    const username = this.auth.GetUser(this.auth.GetToken(req)).name;

    try {
      const response = await this.blaiseApiClient.deleteQuestionnaire(
        this.serverPark,
        questionnaireName,
      );

      this.auditLogger.info(
        req.log,
        `Successfully uninstalled questionnaire ${questionnaireName} by ${username}`,
      );

      return res.status(204).json(response);
    } catch (error: unknown) {
      if (this.errorNotFound(error)) {
        this.auditLogger.error(
          req.log,
          `Attempted to uninstall questionnaire ${questionnaireName} that doesn't exist by ${username}`,
        );

        return res.status(404).json();
      }

      this.auditLogger.error(
        req.log,
        `Failed to uninstall questionnaire ${questionnaireName} by ${username}`,
      );

      return res.status(500).json();
    }
  };

  activateQuestionnaire = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };

    try {
      const response = await this.blaiseApiClient.activateQuestionnaire(
        this.serverPark,
        questionnaireName,
      );

      this.auditLogger.info(req.log, `Successfully activated questionnaire ${questionnaireName}`);

      return res.status(204).json(response);
    } catch (error: unknown) {
      if (this.errorNotFound(error)) {
        this.auditLogger.error(
          req.log,
          `Attempted to activate questionnaire ${questionnaireName} that doesn't exist`,
        );

        return res.status(404).json();
      }

      this.auditLogger.error(req.log, `Failed to activate questionnaire ${questionnaireName}`);

      return res.status(500).json();
    }
  };

  deactivateQuestionnaire = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };

    try {
      const response = await this.blaiseApiClient.deactivateQuestionnaire(
        this.serverPark,
        questionnaireName,
      );

      this.auditLogger.info(req.log, `Successfully deactivated questionnaire ${questionnaireName}`);

      return res.status(204).json(response);
    } catch (error: unknown) {
      if (this.errorNotFound(error)) {
        this.auditLogger.error(
          req.log,
          `Attempted to deactivate questionnaire ${questionnaireName} that doesn't exist`,
        );

        return res.status(404).json();
      }

      this.auditLogger.error(req.log, `Failed to deactivate questionnaire ${questionnaireName}`);

      return res.status(500).json();
    }
  };

  doesQuestionnaireHaveMode = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName, mode } = req.params as { questionnaireName: string; mode: string };

    try {
      const response = await this.blaiseApiClient.doesQuestionnaireHaveMode(
        this.serverPark,
        questionnaireName,
        mode,
      );

      req.log.info(
        { response },
        `Successfully called does questionnaire have mode endpoint for ${questionnaireName}`,
      );

      return res.status(200).json(response);
    } catch (error: unknown) {
      req.log.error(error, `does questionnaire have mode failed for ${questionnaireName}`);

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
          req.log.info(`Questionnaire ${questionnaire.name} returned erroneous.`);
          questionnaire.status = "Failed";
        }

        questionnaire.fieldPeriod = fieldPeriodToText(questionnaire.name);
      });

      req.log.info(
        { questionnaires },
        `${questionnaires.length} questionnaire/s currently installed.`,
      );

      return res.status(200).json(questionnaires);
    } catch (error: unknown) {
      req.log.error(error, "Get questionnaires endpoint failed.");

      return res.status(500).json();
    }
  };

  getCases = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };

    try {
      const caseIds = await this.blaiseApiClient.getQuestionnaireCaseIds(
        this.serverPark,
        questionnaireName,
      );

      req.log.info(
        { caseIds },
        `Successfully called get cases IDs for questionnaire ${questionnaireName}`,
      );

      return res.status(200).json(caseIds);
    } catch (error: unknown) {
      req.log.error(error, `Get cases IDs for questionnaire ${questionnaireName}`);

      return res.status(500).json();
    }
  };

  getModes = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };

    try {
      const modes = await this.blaiseApiClient.getQuestionnaireModes(
        this.serverPark,
        questionnaireName,
      );

      req.log.info(
        { modes },
        `Successfully called get questionnaire modes for ${questionnaireName}`,
      );

      return res.status(200).json(modes);
    } catch (error: unknown) {
      req.log.error(error, `Get questionnaire modes for ${questionnaireName}`);

      return res.status(500).json(null);
    }
  };

  getSettings = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };

    try {
      const questionnaireSettings = await this.blaiseApiClient.getQuestionnaireSettings(
        this.serverPark,
        questionnaireName,
      );

      req.log.info(
        { questionnaireSettings },
        `Successfully called get questionnaire settings for ${questionnaireName}`,
      );

      return res.status(200).json(questionnaireSettings);
    } catch (error: unknown) {
      req.log.error(error, `Get questionnaire settings for ${questionnaireName}`);

      return res.status(500).json();
    }
  };

  getSurveyDays = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };

    try {
      const surveyDays = await this.blaiseApiClient.getSurveyDays(
        this.serverPark,
        questionnaireName,
      );

      req.log.info({ surveyDays }, `Successfully called get survey days for ${questionnaireName}`);

      return res.status(200).json(surveyDays);
    } catch (error: unknown) {
      req.log.error(error, `Get survey days for ${questionnaireName}`);

      return res.status(500).json(null);
    }
  };

  getActiveSurveyDays = async (req: Request, res: Response): Promise<Response> => {
    const { questionnaireName } = req.params as { questionnaireName: string };

    try {
      const surveyDays: string[] = await this.blaiseApiClient.getSurveyDays(
        this.serverPark,
        questionnaireName,
      );
      const hasActiveSurveyDays = Array.isArray(surveyDays) && surveyDays.length > 0;

      req.log.info(
        { questionnaireName, hasActiveSurveyDays },
        `Successfully called active survey days endpoint for ${questionnaireName}`,
      );

      return res.status(200).json(hasActiveSurveyDays);
    } catch (error: unknown) {
      req.log.error(error, `Get active survey days for ${questionnaireName}`);

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
