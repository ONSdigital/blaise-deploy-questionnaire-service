import { QuestionnaireSettings, Questionnaire } from "blaise-api-node-client";
import axios from "axios";
import axiosConfig from "./axiosConfig";

export async function getQuestionnaire(questionnaireName: string): Promise< Questionnaire | undefined> {
    console.log(`Call to getQuestionnaire(${questionnaireName})`);
    const url = `/api/questionnaires/${questionnaireName}`;

    try {
        const response = await axios.get(url, axiosConfig());
        return response.data;
    } catch (error: any) {
        if (error?.isAxiosError && error.response.status === 404) {
            console.log(`Questionnaire ${questionnaireName} does not exist`);
            return undefined;
        }
        console.error(`Failed to get questionnaires ${error}`);
        throw error;
    }
}

export async function getQuestionnaires(): Promise<Questionnaire[]> {
    console.log("Call to getQuestionnaires");
    const url = "/api/questionnaires";

    const response = await axios.get(url, axiosConfig());
    return response.data;
}

export async function deleteQuestionnaire(questionnaireName: string): Promise<boolean> {
    console.log("Call to deleteQuestionnaire");
    const url = `/api/questionnaires/${questionnaireName}`;

    try {
        const response = await axios.delete(url, axiosConfig());
        return response.status === 204;
    } catch (error: unknown) {
        console.error(`Response from deleteQuestionnaire: Error ${error}`);
        return false;
    }
}

export async function activateQuestionnaire(questionnaireName: string): Promise<boolean> {
    console.log("Call to activateQuestionnaire");
    const url = `/api/questionnaires/${questionnaireName}/activate`;

    try {
        const response = await axios.patch(url, undefined, axiosConfig());
        return response.status === 204;
    } catch (error: unknown) {
        console.error(`Response from activateQuestionnaire: Error ${error}`);
        return false;
    }
}

export async function deactivateQuestionnaire(questionnaireName: string): Promise<boolean> {
    console.log("Call to deactivateQuestionnaire");
    const url = `/api/questionnaires/${questionnaireName}/deactivate`;

    try {
        const response = await axios.patch(url, undefined, axiosConfig());
        return response.status === 204;
    } catch (error: unknown) {
        console.error(`Response from deactivateQuestionnaire: Error ${error}`);
        return false;
    }
}

export async function installQuestionnaire(filename: string): Promise<boolean> {
    console.log("Sending request to start install");
    const url = "/api/install";

    try {
        const response = await axios.post(url, { filename: filename }, axiosConfig());
        return response.status === 201;
    } catch (error: unknown) {
        console.error(`Failed to install questionnaire, Error ${error}`);
        return false;

    }
}

export async function getQuestionnaireModes(questionnaireName: string): Promise<string[]> {
    console.log("Sending request get questionnaire modes");
    const url = `/api/questionnaires/${questionnaireName}/modes`;

    try {
        const response = await axios.get(url, axiosConfig());

        return response.data;
    } catch (error: unknown) {
        console.error(`Failed to get questionnaire modes, Error ${error}`);
        throw error;
    }
}

export async function getQuestionnaireSettings(questionnaireName: string): Promise<QuestionnaireSettings[]> {
    console.log("Sending request get questionnaire settings");
    const url = `/api/questionnaires/${questionnaireName}/settings`;

    try {
        const response = await axios.get(url, axiosConfig());

        return response.data;
    } catch (error: unknown) {
        console.error(`Failed to get questionnaire settings, Error ${error}`);
        throw error;
    }
}

export async function getQuestionnaireCaseIds(questionnaireName: string): Promise<string[]> {
    console.log("Call to getQuestionnaireCaseIds");
    const url = `/api/questionnaires/${questionnaireName}/cases/ids`;

    try {
        const response = await axios.get(url, axiosConfig());
        return response.data;
    } catch {
        throw new Error("Failed to get questionnaire case IDs");
    }
}

export async function getSurveyDays(questionnaireName: string): Promise<string[]> {
    console.log("Sending request get survey days");
    const url = `/api/questionnaires/${questionnaireName}/surveydays`;

    try {
        const response = await axios.get(url, axiosConfig());
        return response.data;
    } catch (error: unknown) {
        console.error(`Failed to get survey days, Error ${error}`);
        throw error;
    }
}

export async function surveyIsActive(questionnaireName: string): Promise<boolean> {
    console.log("Sending request get survey is active");
    const url = `/api/questionnaires/${questionnaireName}/active`;

    try {
        const response = await axios.get(url, axiosConfig());
        return response.data;
    } catch (error: unknown) {
        console.error(`Failed to get survey is active, Error ${error}`);
        throw error;
    }
}

export async function signOffQuestionnaire(questionnaireName: string): Promise<boolean> {
    console.log("Call to signOffQuestionnaire");
    const url = `/api/signoff/${questionnaireName}`;

    try {
        const response = await axios.get(url, axiosConfig());
        return response.status === 201;   
    } catch (error: unknown) {
        console.error(`Failed to sign off questionnaire, Error ${error}`);
        return false;
    }  
}

// export async function signOffQuestionnaire(questionnaireName: string): Promise<boolean> {
//     console.log("Sending request to cloud function to sign off questionnaire");
//     const url = `https://${process.env.REACT_APP_FUNCTION_URL}`;
//     console.log(`Url is: ${url}`);

//     try {
//         const response = await axios.post(url, { questionnaire_name: questionnaireName }, axiosConfig());
//         return response.status === 201;
//     } catch (error: unknown) {
//         console.error(`Failed to sign off questionnaire, Error ${error}`);
//         return false;
//     }
// }
