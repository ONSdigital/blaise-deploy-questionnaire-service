import axios from "axios";
import axiosConfig from "./axiosConfig";

export async function setTOStartDate(questionnaireName: string, toStartDate: string | undefined): Promise<boolean> {
    console.log(`Call to setTOStartDate(${questionnaireName}, ${toStartDate})`);
    const url = `/api/tostartdate/${questionnaireName}`;
    const data = { "tostartdate": toStartDate };

    try {
        const response = await axios.post(url, data, axiosConfig());

        return response.status === 200 || response.status === 201;
    } catch (error: unknown) {
        console.error(`Response from set start date Failed: Error ${error}`);
        return false;
    }
}


export async function getTOStartDate(questionnaireName: string): Promise<string> {
    console.log(`Call to getTOStartDate(${questionnaireName})`);
    const url = `/api/tostartdate/${questionnaireName}`;

    try {
        const response = await axios.get(url, axiosConfig());
        if (!response.data.tostartdate) {
            console.log("throw that error");
            throw new Error("No tostartdate in response");
        }
        return response.data.tostartdate;
    } catch (error: any) {
        if (error?.isAxiosError && error.response.status === 404) {
            return "";
        }
        console.error(`Response from set start date Failed: Error ${error}`);
        throw error;
    }
}


export async function deleteTOStartDate(questionnaireName: string): Promise<boolean> {
    console.log(`Call to deleteTOStartDate(${questionnaireName})`);
    const url = `/api/tostartdate/${questionnaireName}`;

    try {
        const response = await axios.delete(url, axiosConfig());
        return response.status === 204;
    } catch (error: unknown) {
        console.error(`Response from delete TO start date Failed: Error ${error}`);
        return false;
    }
}
