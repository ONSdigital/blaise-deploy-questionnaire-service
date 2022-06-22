import axios from "axios";
import axiosConfig from "./axiosConfig";

export async function setTMReleaseDate(questionnaireName: string, tmReleaseDate: string | undefined): Promise<boolean> {
    console.log(`Call to setTMReleaseDate(${questionnaireName}, ${tmReleaseDate})`);
    const url = `/api/tmreleasedate/${questionnaireName}`;
    const data = { "tmreleasedate": tmReleaseDate };

    try {
        const response = await axios.post(url, data, axiosConfig());

        return response.status === 200 || response.status === 201;
    } catch (error: unknown) {
        console.error(`Response from set release date Failed: Error ${error}`);
        return false;
    }
}

export async function getTMReleaseDate(questionnaireName: string): Promise<string> {
    console.log(`Call to getTMReleaseDate(${questionnaireName})`);
    const url = `/api/tmreleasedate/${questionnaireName}`;

    try {
        const response = await axios.get(url, axiosConfig());
        if (!response.data.tmreleasedate) {
            console.log("throw that error: No tmreleasedate in response");
            throw new Error("No tmreleasedate in response");
        }
        return response.data.tmreleasedate;
    } catch (error: any) {
        if (error?.isAxiosError && error.response.status === 404) {
            return "";
        }
        console.error(`Response from set release date Failed: Error ${error}`);
        throw error;
    }
}

export async function deleteTMReleaseDate(questionnaireName: string): Promise<boolean> {
    console.log(`Call to deleteTMReleaseDate(${questionnaireName})`);
    const url = `/api/tmreleasedate/${questionnaireName}`;

    try {
        const response = await axios.delete(url, axiosConfig());
        return response.status === 204;
    } catch (error: unknown) {
        console.error(`Response from delete TM release date Failed: Error ${error}`);
        return false;
    }
}
