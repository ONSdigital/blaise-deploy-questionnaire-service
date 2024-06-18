import express, { Request, Response, Router } from "express";
import axios, { AxiosRequestConfig } from "axios";

export default function newSignOffHandlerr(): Router {
    const router = express.Router();

    const signOffHandler = new SignOffHandler();
    return router.post("/api/signoff/:questionnaireName", signOffHandler.SignOffQuestionnaire);
}

function axiosConfig(): AxiosRequestConfig {
    return {
        headers: {
            "Content-Type": "application/json",
        }
    };
}

export class SignOffHandler {

    constructor() {
        this.SignOffQuestionnaire = this.SignOffQuestionnaire.bind(this);
    }

    async SignOffQuestionnaire(req: Request, res: Response): Promise<Response> {
        const { questionnaireName } = req.params;
        console.log(`Questionnaire is: ${questionnaireName}`);
        const url = `https://${process.env.REACT_APP_FUNCTION_URL}`;
        console.log(`Url is: ${url}`);

        try {
            await axios.post(url, { questionnaire_name: questionnaireName }, axiosConfig());
            return res.status(200).json();
        } catch (error: any) {
            req.log.error(error, "Failed calling getAuditLogs");
            return res.status(500).json(error);
        }
    }
}
