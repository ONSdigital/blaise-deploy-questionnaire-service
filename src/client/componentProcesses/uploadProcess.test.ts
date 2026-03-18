import { uploadAndInstallFile, validateSelectedQuestionnaireExists } from "./uploadProcess";
import { totalmobileReleaseDateSurveyTLAs } from "../../utilities/totalmobileReleaseDateSurveyTLAs";

import { getQuestionnaire } from "../questionnaires";
import { setTOStartDate } from "../toStartDate";
import { setTMReleaseDate } from "../tmReleaseDate";

jest.mock("../questionnaires", () => ({
    getQuestionnaire: jest.fn(),
    getQuestionnaireSettings: jest.fn(),
    getQuestionnaireModes: jest.fn(),
    deactivateQuestionnaire: jest.fn(),
}));

jest.mock("../upload", () => ({
    initialiseUpload: jest.fn(),
    uploadFile: jest.fn(),
}));

jest.mock("../toStartDate", () => ({
    setTOStartDate: jest.fn(),
}));

jest.mock("../tmReleaseDate", () => ({
    setTMReleaseDate: jest.fn(),
}));

jest.mock("./index", () => ({
    verifyAndInstallQuestionnaire: jest.fn().mockResolvedValue([true, "ok"]),
}));

jest.mock("../../client/logger", () => ({
    clientLogger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

describe("uploadProcess", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns null when no file selected", async () => {
        const setQuestionnaireName = jest.fn();
        const setUploadStatus = jest.fn();
        const setFoundQuestionnaire = jest.fn();

        const result = await validateSelectedQuestionnaireExists(undefined, setQuestionnaireName, setUploadStatus, setFoundQuestionnaire);
        expect(result).toBeNull();
    });

    it("returns false when uploadAndInstallFile has no file", async () => {
        const result = await uploadAndInstallFile(
            "OPN2004A",
            undefined,
            undefined,
            undefined,
            jest.fn(),
            jest.fn(),
            jest.fn()
        );
        expect(result).toEqual(false);
    });

    it("handles Totalmobile release date failure", async () => {
        const tla = totalmobileReleaseDateSurveyTLAs[0] || "OPN";
        const questionnaireName = `${tla}2004A`;

        (setTOStartDate as jest.Mock).mockResolvedValue(true);
        (setTMReleaseDate as jest.Mock).mockResolvedValue(false);

        const setUploading = jest.fn();
        const setUploadStatus = jest.fn();

        const file = { name: `${questionnaireName}.bpkg` } as any as File;

        const result = await uploadAndInstallFile(
            questionnaireName,
            "2022-12-31",
            "2022-12-31",
            file,
            setUploading,
            setUploadStatus,
            jest.fn()
        );

        expect(result).toEqual(false);
        expect(setUploadStatus).toHaveBeenCalledWith("Failed to store Totalmobile release date specified");
        expect(setUploading).toHaveBeenCalledWith(false);
    });
});
