import {
    checkInstrumentAlreadyExists,
    initialiseUpload,
    setTOStartDate,
    uploadFile,
    getInstrumentSettings,
    getInstrumentModes,
    deactivateInstrument,
} from "../../utilities/http";
import {
    GetStrictInterviewingSettings,
    ValidateSettings,
} from "../../utilities/instrument_settings";
import { Instrument } from "../../../Interfaces";
import { verifyAndInstallInstrument } from "../../utilities/processes";
import { GetInstrumentMode } from "../../utilities/instrument_mode";
import { InstrumentSettings } from "blaise-api-node-client";

export async function validateSelectedInstrumentExists(file: File | undefined, setInstrumentName: (status: string) => void, setUploadStatus: (status: string) => void, setFoundInstrument: (object: Instrument | null) => void): Promise<boolean | null> {
    if (file === undefined) {
        return null;
    }

    const fileName = file.name;
    const instrumentName = fileName.replace(/\.[a-zA-Z]*$/, "");

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

export async function uploadAndInstallFile(
    instrumentName: string,
    toStartDate: string | undefined,
    file: File | undefined,
    setUploading: (boolean: boolean) => void,
    setUploadStatus: (status: string) => void,
    onFileUploadProgress: (progressEvent: ProgressEvent) => void
): Promise<boolean> {
    if (file === undefined) {
        return false;
    }
    console.log("Start uploading the file");

    console.log(`liveDate ${toStartDate}`);
    const liveDateCreated = await setTOStartDate(instrumentName, toStartDate);
    if (!liveDateCreated) {
        setUploadStatus("Failed to store telephone operations start date specified");
        setUploading(false);
        return false;
    }

    // Get the signed url to allow access to the bucket
    const [initialised, signedUrl] = await initialiseUpload(file.name);
    if (!initialised) {
        console.error("Failed to initialiseUpload");
        setUploadStatus("Failed to upload questionnaire");
        setUploading(false);
        return false;
    }

    setUploading(true);

    // Upload the file using the GCP bucket url
    const uploaded = await uploadFile(signedUrl, file, onFileUploadProgress);
    setUploading(false);
    if (!uploaded) {
        console.error("Failed to Upload file");
        setUploadStatus("Failed to upload questionnaire");
        return false;
    }


    // Validate the file is in the bucket and call the rest API to install
    const [installed, message] = await verifyAndInstallInstrument(file.name);
    if (!installed) {
        setUploadStatus(message);
    }
    return installed;
}

export async function checkInstrumentSettings(
    instrumentName: string,
    setInstrumentSettings: (instrumentSettings: InstrumentSettings) => void,
    setInvalidSettings: (invalidSettings: Partial<InstrumentSettings>) => void,
    setErrored: (errored: boolean) => void
): Promise<boolean> {
    const instrumentSettingsList = await getInstrumentSettings(instrumentName);
    const instrumentModes = await getInstrumentModes(instrumentName);
    if (instrumentSettingsList.length == 0 || instrumentModes.length == 0) {
        setErrored(true);
        return false;
    }
    const instrumentSettings = GetStrictInterviewingSettings(instrumentSettingsList);
    setInstrumentSettings(instrumentSettings);
    const [valid, invalidSettings] = ValidateSettings(instrumentSettings, GetInstrumentMode(instrumentModes));
    setInvalidSettings(invalidSettings);

    if (!valid) {
        deactivateInstrument(instrumentName);
    }

    return valid;
}
