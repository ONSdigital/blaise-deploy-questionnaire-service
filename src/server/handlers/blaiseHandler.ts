import express, { Request, Response, Router } from "express";
import { Auth } from "blaise-login-react-server";
import BlaiseApiClient, { InstallQuestionnaire, Questionnaire } from "blaise-api-node-client";
import { fieldPeriodToText } from "../functions";
import AuditLogger from "../auditLogging/logger";

export default function NewBlaiseHandler(blaiseApiClient: BlaiseApiClient, serverPark: string, auth: Auth, auditLogger: AuditLogger): Router {
    const router = express.Router();

    const blaiseHandler = new BlaiseHandler(blaiseApiClient, serverPark, auditLogger);

    router.get("/api/health/diagnosis", auth.Middleware, blaiseHandler.GetHealth);
    router.get("/api/questionnaires", auth.Middleware, blaiseHandler.GetQuestionnaires);
    router.get("/api/questionnaires/:questionnaireName", auth.Middleware, blaiseHandler.GetQuestionnaire);
    router.get("/api/questionnaires/:questionnaireName/modes", auth.Middleware, blaiseHandler.GetModes);
    router.get("/api/questionnaires/:questionnaireName/modes/:mode", auth.Middleware, blaiseHandler.DoesQuestionnaireHaveMode);
    router.get("/api/questionnaires/:questionnaireName/settings", auth.Middleware, blaiseHandler.GetSettings);
    router.get("/api/questionnaires/:questionnaireName/surveydays", auth.Middleware, blaiseHandler.GetSurveyDays);
    // router.get("/api/questionnaires/:questionnaireName/active", auth.Middleware, blaiseHandler.GetSurveyIsActive);
    router.get("/api/questionnaires/:questionnaireName/cases/ids", auth.Middleware, blaiseHandler.GetCases);
    router.post("/api/install", auth.Middleware, blaiseHandler.InstallQuestionnaire);
    router.patch("/api/questionnaires/:questionnaireName/activate", auth.Middleware, blaiseHandler.ActivateQuestionnaire);
    router.patch("/api/questionnaires/:questionnaireName/deactivate", auth.Middleware, blaiseHandler.DeactivateQuestionnaire);
    router.delete("/api/questionnaires/:questionnaireName", auth.Middleware, blaiseHandler.DeleteQuestionnaire);

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
        this.GetQuestionnaire = this.GetQuestionnaire.bind(this);
        this.InstallQuestionnaire = this.InstallQuestionnaire.bind(this);
        this.DeleteQuestionnaire = this.DeleteQuestionnaire.bind(this);
        this.ActivateQuestionnaire = this.ActivateQuestionnaire.bind(this);
        this.DeactivateQuestionnaire = this.DeactivateQuestionnaire.bind(this);
        this.DoesQuestionnaireHaveMode = this.DoesQuestionnaireHaveMode.bind(this);
        this.GetQuestionnaires = this.GetQuestionnaires.bind(this);
        this.GetCases = this.GetCases.bind(this);
        this.GetModes = this.GetModes.bind(this);
        this.GetSettings = this.GetSettings.bind(this);
        this.GetSurveyDays = this.GetSurveyDays.bind(this);
        // this.GetSurveyIsActive = this.GetSurveyIsActive.bind(this);
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

    async GetQuestionnaire(req: Request, res: Response): Promise<Response> {
        const { questionnaireName } = req.params;

        try {
            const questionnaire = await this.blaiseApiClient.getQuestionnaire(this.serverPark, questionnaireName);
            req.log.info({ questionnaire }, `Get questionnaire ${questionnaireName} endpoint`);
            return res.status(200).json(questionnaire);
        } catch (error: any) {
            if (this.errorNotFound(error)) {
                return res.status(404).json();
            }
            console.log(error);
            req.log.error(error, "Get questionnaire endpoint failed");
            return res.status(500).json();
        }
    }

    async InstallQuestionnaire(req: Request, res: Response): Promise<Response> {
        const filename: string = req.body.filename;
        const questionnaireName = filename?.toString().replace(/\.[a-zA-Z]*$/, "");
        const installQuestionnaire: InstallQuestionnaire = {
            questionnaireFile: filename?.toString() || ""
        };
        try {
            const response = await this.blaiseApiClient.installQuestionnaire(this.serverPark, installQuestionnaire);
            this.auditLogger.info(req.log, `Successfully installed questionnaire ${questionnaireName}`);
            return res.status(201).json(response);
        } catch (error: any) {
            req.log.error(error, "Install questionnaire endpoint failed");
            this.auditLogger.error(req.log, `Failed to install questionnaire ${questionnaireName}`);
            return res.status(500).json();
        }
    }

    async DeleteQuestionnaire(req: Request, res: Response): Promise<Response> {
        const { questionnaireName } = req.params;

        try {
            const response = await this.blaiseApiClient.deleteQuestionnaire(this.serverPark, questionnaireName);
            this.auditLogger.info(req.log, `Successfully uninstalled questionnaire ${questionnaireName}`);
            return res.status(204).json(response);
        } catch (error: any) {
            if (this.errorNotFound(error)) {
                this.auditLogger.error(req.log, `Attempted to uninstall questionnaire ${questionnaireName} that doesn't exist`);
                return res.status(404).json();
            }
            this.auditLogger.error(req.log, `Failed to uninstall questionnaire ${questionnaireName}`);
            return res.status(500).json();
        }
    }

    async ActivateQuestionnaire(req: Request, res: Response): Promise<Response> {
        const { questionnaireName } = req.params;

        try {
            const response = await this.blaiseApiClient.activateQuestionnaire(this.serverPark, questionnaireName);
            this.auditLogger.info(req.log, `Successfully activated questionnaire ${questionnaireName}`);
            return res.status(204).json(response);
        } catch (error: any) {
            if (this.errorNotFound(error)) {
                this.auditLogger.error(req.log, `Attempted to activate questionnaire ${questionnaireName} that doesn't exist`);
                return res.status(404).json();
            }
            this.auditLogger.error(req.log, `Failed to activate questionnaire ${questionnaireName}`);
            return res.status(500).json();
        }
    }

    async DeactivateQuestionnaire(req: Request, res: Response): Promise<Response> {
        const { questionnaireName } = req.params;

        try {
            const response = await this.blaiseApiClient.deactivateQuestionnaire(this.serverPark, questionnaireName);
            this.auditLogger.info(req.log, `Successfully deactivated questionnaire ${questionnaireName}`);
            return res.status(204).json(response);
        } catch (error: any) {
            if (this.errorNotFound(error)) {
                this.auditLogger.error(req.log, `Attempted to deactivate questionnaire ${questionnaireName} that doesn't exist`);
                return res.status(404).json();
            }
            this.auditLogger.error(req.log, `Failed to deactivate questionnaire ${questionnaireName}`);
            return res.status(500).json();
        }
    }

    async DoesQuestionnaireHaveMode(req: Request, res: Response): Promise<Response> {
        const { questionnaireName, mode } = req.params;

        try {
            const response = await this.blaiseApiClient.doesQuestionnaireHaveMode(this.serverPark, questionnaireName, mode);
            req.log.info({ response }, `Successfully called does questionnaire have mode endpoint for ${questionnaireName}`);
            return res.status(200).json(response);
        } catch (error: any) {
            req.log.error(error, `does questionnaire have mode failed for ${questionnaireName}`);
            return res.status(500).json();
        }
    }

    async GetQuestionnaires(req: Request, res: Response): Promise<Response> {
        try {
            const questionnaires: Questionnaire[] = await this.blaiseApiClient.getQuestionnaires(this.serverPark);
            questionnaires.forEach(function (questionnaire: Questionnaire) {
                if (questionnaire.status === "Erroneous") {
                    req.log.info(`Questionnaire ${questionnaire.name} returned erroneous.`);
                    questionnaire.status = "Failed";
                }
                questionnaire.fieldPeriod = fieldPeriodToText(questionnaire.name);
            });

            req.log.info({ questionnaires }, `${questionnaires.length} questionnaire/s currently installed.`);
            return res.status(200).json(questionnaires);
        } catch (error: any) {
            req.log.error(error, "Get questionnaires endpoint failed.");
            return res.status(500).json();
        }
    }

    async GetCases(req: Request, res: Response): Promise<Response> {
        const { questionnaireName } = req.params;

        try {
            const caseIds = await this.blaiseApiClient.getQuestionnaireCaseIds(this.serverPark, questionnaireName);
            req.log.info({ caseIds }, `Successfully called get cases IDs for questionnaire ${questionnaireName}`);
            return res.status(200).json(caseIds);
        } catch (error: any) {
            req.log.error(error, `Get cases IDs for questionnaire ${questionnaireName}`);
            return res.status(500).json();
        }
    }

    async GetModes(req: Request, res: Response): Promise<Response> {
        const { questionnaireName } = req.params;

        try {
            const modes = await this.blaiseApiClient.getQuestionnaireModes(this.serverPark, questionnaireName);
            req.log.info({ modes }, `Successfully called get questionnaire modes for ${questionnaireName}`);
            return res.status(200).json(modes);
        } catch (error: any) {
            req.log.error(error, `Get questionnaire modes for ${questionnaireName}`);
            return res.status(500).json(null);
        }
    }

    async GetSettings(req: Request, res: Response): Promise<Response> {
        const { questionnaireName } = req.params;

        try {
            const questionnaireSettings = await this.blaiseApiClient.getQuestionnaireSettings(this.serverPark, questionnaireName);
            req.log.info({ questionnaireSettings }, `Successfully called get questionnaire settings for ${questionnaireName}`);
            return res.status(200).json(questionnaireSettings);
        } catch (error: any) {
            req.log.error(error, `Get questionnaire settings for ${questionnaireName}`);
            return res.status(500).json();
        }
    }

    async GetSurveyDays(req: Request, res: Response): Promise<Response> {
        const { questionnaireName } = req.params;

        try {
            const surveyDays = await this.blaiseApiClient.getSurveyDays(this.serverPark, questionnaireName);
            req.log.info({ surveyDays }, `Successfully called get survey days for ${questionnaireName}`);
            return res.status(200).json(surveyDays);
        } catch (error: any) {
            req.log.error(error, `Get survey days for ${questionnaireName}`);
            return res.status(500).json(null);
        }
    }

    // async GetSurveyIsActive(req: Request, res: Response): Promise<Response> {
    //     const { questionnaireName } = req.params;
    //     try {
    //         const surveyDays = await this.blaiseApiClient.getSurveyDays(this.serverPark, questionnaireName);
    //         const surveyActiveStatus = surveyIsActive(surveyDays);
    //         req.log.info({ surveyActiveStatus }, `Successfully called get survey is active for ${questionnaireName}`);
    //         return res.status(200).json(surveyActiveStatus);
    //     } catch (error: any) {
    //         req.log.error(error, `Get survey is active for ${questionnaireName}`);
    //         return res.status(500).json(null);
    //     }
    // }

    errorNotFound(error: any): boolean {
        return (error?.isAxiosError && error.response.status === 404);
    }
}
