import { AxiosProgressEvent } from "axios";
import {
    getQuestionnaire,
    getQuestionnaireSettings,
    getQuestionnaireModes,
    deactivateQuestionnaire,
} from "../questionnaires";
import {
    initialiseUpload,
    uploadFile
} from "../upload";
import { setTOStartDate } from "../toStartDate";
import { setTMReleaseDate } from "../tmReleaseDate";
import {
    GetStrictInterviewingSettings,
    ValidateSettings,
} from "../../utilities/questionnaireSettings";
import { verifyAndInstallQuestionnaire } from ".";
import { GetQuestionnaireMode } from "../../utilities/questionnaireMode";
import { QuestionnaireSettings, Questionnaire } from "blaise-api-node-client";
import { totalmobileReleaseDateSurveyTLAs } from "../../utilities/totalmobileReleaseDateSurveyTLAs";

export async function validateSelectedQuestionnaireExists(file: File | undefined, setQuestionnaireName: (status: string) => void, setUploadStatus: (status: string) => void, setFoundQuestionnaire: (object: Questionnaire | null) => void): Promise<boolean | null> {
    if (file === undefined) {
        return null;
    }

    const fileName = file.name;
    const questionnaireName = fileName.replace(/\.[a-zA-Z]*$/, "");

    setQuestionnaireName(questionnaireName);

    let questionnaire: Questionnaire | undefined;
    try {
        questionnaire = await getQuestionnaire(questionnaireName);
    } catch {
        console.log("Failed to validate if questionnaire already exists");
        setUploadStatus("Failed to validate if questionnaire already exists");
        return null;
    }

    if (questionnaire) {
        setFoundQuestionnaire(questionnaire);
        return true;
    }

    return false;
}

export async function uploadAndInstallFile(
    questionnaireName: string,
    toStartDate: string | undefined,
    tmReleaseDate: string | undefined,
    file: File | undefined,
    setUploading: (boolean: boolean) => void,
    setUploadStatus: (status: string) => void,
    onFileUploadProgress: (progressEvent: AxiosProgressEvent) => void
): Promise<boolean> {
    if (file === undefined) {
        return false;
    }
    console.log("Start uploading the file");

    console.log(`liveDate ${toStartDate}`);
    const liveDateCreated = await setTOStartDate(questionnaireName, toStartDate);
    if (!liveDateCreated) {
        setUploadStatus("Failed to store telephone operations start date specified");
        setUploading(false);
        return false;
    }

    if (totalmobileReleaseDateSurveyTLAs.some(tla => questionnaireName.startsWith(tla))) {
        console.log(`releaseDate ${tmReleaseDate}`);
        const releaseDateCreated = await setTMReleaseDate(questionnaireName, tmReleaseDate);

        if (!releaseDateCreated) {
            setUploadStatus("Failed to store Totalmobile release date specified");
            setUploading(false);
            return false;
        }
    }

    // Get the signed url to allow access to the bucket
    let signedUrl: string;
    try {
        signedUrl = await initialiseUpload(file.name);
    } catch {
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
    const [installed, message] = await verifyAndInstallQuestionnaire(file.name);
    if (!installed) {
        setUploadStatus(message);
    }
    return installed;
}

export async function checkQuestionnaireSettings(
    questionnaireName: string,
    setQuestionnaireSettings: (questionnaireSettings: QuestionnaireSettings) => void,
    setInvalidSettings: (invalidSettings: Partial<QuestionnaireSettings>) => void,
    setErrored: (errored: boolean) => void
): Promise<boolean> {
    let questionnaireSettingsList: QuestionnaireSettings[];
    let questionnaireModes: string[];
    try {
        questionnaireSettingsList = await getQuestionnaireSettings(questionnaireName);
        questionnaireModes = await getQuestionnaireModes(questionnaireName);
        if (questionnaireSettingsList.length == 0 || questionnaireModes.length == 0) {
            setErrored(true);
            return false;
        }
    } catch {
        setErrored(true);
        return false;
    }
    const questionnaireSettings = GetStrictInterviewingSettings(questionnaireSettingsList);
    setQuestionnaireSettings(questionnaireSettings);
    const [valid, invalidSettings] = ValidateSettings(questionnaireSettings, GetQuestionnaireMode(questionnaireModes));
    setInvalidSettings(invalidSettings);

    if (!valid) {
        deactivateQuestionnaire(questionnaireName);
    }

    return valid;
}
