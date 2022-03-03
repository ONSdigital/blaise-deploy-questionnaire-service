import { InstrumentUacDetailsByCaseId } from "bus-api-node-client";
import axios from "axios";
import axiosConfig from "./axiosConfig";


export async function generateUACCodes(instrumentName: string): Promise<boolean> {
    console.log("Sending request generate UAC codes");
    const url = `/api/uacs/instrument/${instrumentName}`;

    try {
        const response = await axios.post(url, null, axiosConfig());
        return response.status === 200;
    } catch {
        return false;
    }
}

export async function getCountOfUACs(instrumentName: string): Promise<number> {
    console.log(`Sending request to get UAC code count for ${instrumentName}`);
    const url = `/api/uacs/instrument/${instrumentName}/count`;

    try {
        const response = await axios.get(url, axiosConfig());
        if (typeof response.data.count !== "number") {
            throw new Error("UAC count was not a number");
        }
        return response.data.count;
    } catch (error: unknown) {
        console.error(`Failed to get UAC code count, Error ${error}`);
        throw error;
    }
}

export async function getUACCodesByCaseID(instrumentName: string): Promise<InstrumentUacDetailsByCaseId> {
    console.log(`Sending request to get UAC codes by case ID ${instrumentName}`);
    const url = `/api/uacs/instrument/${instrumentName}/bycaseid`;

    try {
        const response = await axios.get(url, axiosConfig());
        return response.data;
    } catch (error: unknown) {
        console.error(`Failed to get UAC codes by case ID, Error ${error}`);
        throw new Error("Failed to get UAC codes by case ID");
    }
}
