import { InstrumentSettings, Instrument } from "blaise-api-node-client";
import axios from "axios";
import axiosConfig from "./axiosConfig";

export async function getInstrument(instrumentName: string): Promise<Instrument | undefined> {
    console.log(`Call to checkSurveyAlreadyExists(${instrumentName})`);
    const url = `/api/instruments/${instrumentName}`;

    try {
        const response = await axios.get(url, axiosConfig());
        return response.data;
    } catch (error: any) {
        if (error.isAxiosError && error.response.status === 404) {
            console.log(`Instrument ${instrumentName} does not exist`);
            return undefined;
        }
        console.error(`Failed to get instruments ${error}`);
        throw error;
    }
}

export async function getInstruments(): Promise<Instrument[]> {
    console.log("Call to getInstruments");
    const url = "/api/instruments";

    const response = await axios.get(url, axiosConfig());
    return response.data;
}

export async function deleteInstrument(instrumentName: string): Promise<boolean> {
    console.log("Call to deleteInstrument");
    const url = `/api/instruments/${instrumentName}`;

    try {
        const response = await axios.delete(url, axiosConfig());
        return response.status === 204;
    } catch (error: unknown) {
        console.error(`Response from deleteInstrument: Error ${error}`);
        return false;
    }
}

export async function activateInstrument(instrumentName: string): Promise<boolean> {
    console.log("Call to activateInstrument");
    const url = `/api/instruments/${instrumentName}/activate`;

    try {
        const response = await axios.patch(url, axiosConfig());
        return response.status === 204;
    } catch (error: unknown) {
        console.error(`Response from activateInstrument: Error ${error}`);
        return false;
    }
}

export async function deactivateInstrument(instrumentName: string): Promise<boolean> {
    console.log("Call to deactivateInstrument");
    const url = `/api/instruments/${instrumentName}/deactivate`;

    try {
        const response = await axios.patch(url, axiosConfig());
        return response.status === 204;
    } catch (error: unknown) {
        console.error(`Response from deactivateInstrument: Error ${error}`);
        return false;
    }
}

export async function installInstrument(filename: string): Promise<boolean> {
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

export async function getInstrumentModes(instrumentName: string): Promise<string[]> {
    console.log("Sending request get instrument modes");
    const url = `/api/instruments/${instrumentName}/modes`;

    try {
        const response = await axios.get(url, axiosConfig());

        return response.data;
    } catch (error: unknown) {
        console.error(`Failed to get instrument modes, Error ${error}`);
        throw error;
    }
}

export async function getInstrumentSettings(instrumentName: string): Promise<InstrumentSettings[]> {
    console.log("Sending request get instrument settings");
    const url = `/api/instruments/${instrumentName}/settings`;

    try {
        const response = await axios.get(url, axiosConfig());

        return response.data;
    } catch (error: unknown) {
        console.error(`Failed to get instrument settings, Error ${error}`);
        throw error;
    }
}

export async function getInstrumentCaseIds(instrumentName: string): Promise<string[]> {
    console.log("Call to getInstrumentCaseIds");
    const url = `/api/instruments/${instrumentName}/cases/ids`;

    try {
        const response = await axios.get(url, axiosConfig());
        return response.data;
    } catch {
        throw new Error("Failed to get instrument case IDs");
    }
}
