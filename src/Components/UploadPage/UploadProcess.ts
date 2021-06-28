import {
    checkInstrumentAlreadyExists,
    initialiseUpload,
    uploadFile,
    verifyAndInstallInstrument
} from "../../utilities/http";
import {Instrument} from "../../../Interfaces";

export async function validateSelectedInstrumentExists(file: File | undefined, setInstrumentName: (status: string) => void, setUploadStatus: (status: string) => void, setFoundInstrument: (object: Instrument  | null) => void): Promise<boolean | null> {
    if (file === undefined) {
        return null;
    }

    const fileName = file.name;
    const instrumentName = fileName.replace(/\.[a-zA-Z]*$/, "");
    const fileExtension = fileName.match(/\.[a-zA-Z]*$/) || [];

    if (fileExtension[0] !== ".bpkg") {
        return null;
    }

    setInstrumentName(instrumentName);

    const [alreadyExists, instrument] = await checkInstrumentAlreadyExists(instrumentName);
    if (alreadyExists === null) {
        console.log("Failed to validate if questionnaire already exists");
        setUploadStatus("Failed to validate if questionnaire already exists");
        return null;
    }

    if (alreadyExists) {
        setFoundInstrument(instrument);
    }

    return alreadyExists;
}

export async function uploadAndInstallFile(file: File | undefined, setUploading: (boolean: boolean) => void, setUploadStatus: (status: string) => void, onFileUploadProgress: (progressEvent: ProgressEvent) => void): Promise<void> {
    if (file === undefined) {
        return;
    }
    console.log("Start uploading the file");
    setUploading(true);

    // Get the signed url to allow access to the bucket
    const [initialised, signedUrl] = await initialiseUpload(file.name);
    if (!initialised) {
        console.error("Failed to initialiseUpload");
        setUploadStatus("Failed to upload questionnaire");
        setUploading(false);
        return;
    }

    // Upload the file using the GCP bucket url
    const uploaded = await uploadFile(signedUrl, file, onFileUploadProgress);
    setUploading(false);
    if (!uploaded) {
        console.error("Failed to Upload file");
        setUploadStatus("Failed to upload questionnaire");
        return;
    }


    // Validate the file is in the bucket and call the rest API to install
    const [installed, message] = await verifyAndInstallInstrument(file.name);
    if (!installed) {
        setUploadStatus(message);
    }
}