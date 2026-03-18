import { verifyAndInstallQuestionnaire } from "./deployQuestionnaire";
import { validateUploadIsComplete } from "../upload";
import { installQuestionnaire } from "../questionnaires";

jest.mock("../upload", () => ({
    validateUploadIsComplete: jest.fn(),
}));

jest.mock("../questionnaires", () => ({
    installQuestionnaire: jest.fn(),
}));

jest.mock("../../client/logger", () => ({
    clientLogger: {
        error: jest.fn(),
    },
}));

describe("verifyAndInstallQuestionnaire", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns failure when upload validation fails", async () => {
        (validateUploadIsComplete as jest.Mock).mockResolvedValue(false);

        await expect(verifyAndInstallQuestionnaire("OPN2004A.bpkg")).resolves.toEqual([
            false,
            "Failed to validate if file has been uploaded successfully",
        ]);
        expect(installQuestionnaire).not.toHaveBeenCalled();
    });

    it("returns failure when install fails", async () => {
        (validateUploadIsComplete as jest.Mock).mockResolvedValue(true);
        (installQuestionnaire as jest.Mock).mockResolvedValue(false);

        await expect(verifyAndInstallQuestionnaire("OPN2004A.bpkg")).resolves.toEqual([
            false,
            "Failed to install the questionnaire",
        ]);
    });
});
