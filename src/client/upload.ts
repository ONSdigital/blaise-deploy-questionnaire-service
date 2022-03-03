import axios from "axios";
import axiosConfig from "./axiosConfig";

export async function initialiseUpload(filename: string): Promise<string> {
    console.log(`Call to initialiseUpload(${filename})`);
    const url = `/upload/init?filename=${filename}`;

    try {
        const response = await axios.get(url, axiosConfig());// Validate the url is a valid url for storage.googleapis.com
        const signedUrlHost = new URL(response.data).host;
        const allowedHosts = [
            "storage.googleapis.com"
        ];

        if (!allowedHosts.includes(signedUrlHost)) {
            throw `Signed URL received was not one of the allowed hosts of: ${allowedHosts}`;
        }
        return response.data;
    } catch (error: unknown) {
        console.error(`Response from initialise Upload: Error ${error}`);
        throw error;
    }
}

export async function validateUploadIsComplete(filename: string): Promise<boolean> {
    console.log(`Call to validateUploadIsComplete(${filename})`);
    const url = `/upload/verify?filename=${filename}`;

    try {
        const response = await axios.get(url, axiosConfig());
        return response.data.name === filename;
    } catch (error: unknown) {
        console.error(`Response from check bucket Failed: Error ${error}`);
        return false;
    }
}

export async function uploadFile(url: string, file: File, onFileUploadProgress: (event: ProgressEvent) => void): Promise<boolean> {
    const config = {
        onUploadProgress: (progressEvent: ProgressEvent) => onFileUploadProgress(progressEvent),
        headers: {
            "Content-Type": "application/octet-stream",
        }
    };

    console.log("Uploading to bucket");
    try {
        await axios.put(url, file, config);
        console.log("File successfully uploaded");
        return true;
    } catch (error: unknown) {
        console.error(`File failed to upload ${error}`);
        return false;
    }
}

export async function getAllInstrumentsInBucket(): Promise<string[]> {
    console.log("Call to getAllInstruments");
    const url = "/bucket/files";

    const response = await axios.get(url, axiosConfig());
    return response.data;
}
