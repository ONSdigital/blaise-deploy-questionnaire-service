import { totalmobileReleaseDateSurveyTLAs } from "../../utilities/totalmobileReleaseDateSurveyTLAs";
import { setTmReleaseDate } from "../tmReleaseDate";
import { setToStartDate } from "../toStartDate";

import { uploadAndInstallFile, validateSelectedQuestionnaireExists } from "./uploadProcess";

vi.mock("../questionnaires", () => ({
  getQuestionnaire: vi.fn(),
  getQuestionnaireSettings: vi.fn(),
  getQuestionnaireModes: vi.fn(),
  deactivateQuestionnaire: vi.fn(),
}));

vi.mock("../upload", () => ({
  initialiseUpload: vi.fn(),
  uploadFile: vi.fn(),
}));

vi.mock("../toStartDate", () => ({
  setToStartDate: vi.fn(),
}));

vi.mock("../tmReleaseDate", () => ({
  setTmReleaseDate: vi.fn(),
}));

vi.mock("./index", () => ({
  verifyAndInstallQuestionnaire: vi.fn().mockResolvedValue([true, "ok"]),
}));

vi.mock("../../client/logger", () => ({
  clientLogger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("uploadProcess", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no file selected", async () => {
    const setQuestionnaireName = vi.fn();
    const setUploadStatus = vi.fn();
    const setFoundQuestionnaire = vi.fn();

    const result = await validateSelectedQuestionnaireExists(
      undefined,
      setQuestionnaireName,
      setUploadStatus,
      setFoundQuestionnaire,
    );

    expect(result).toBeNull();
  });

  it("returns false when uploadAndInstallFile has no file", async () => {
    const result = await uploadAndInstallFile(
      "OPN2004A",
      undefined,
      undefined,
      undefined,
      vi.fn(),
      vi.fn(),
      vi.fn(),
    );

    expect(result).toEqual(false);
  });

  it("handles Totalmobile release date failure", async () => {
    const tla = totalmobileReleaseDateSurveyTLAs[0] || "OPN";
    const questionnaireName = `${tla}2004A`;

    vi.mocked(setToStartDate).mockResolvedValue(true);
    vi.mocked(setTmReleaseDate).mockResolvedValue(false);

    const setUploading = vi.fn();
    const setUploadStatus = vi.fn();

    const file = { name: `${questionnaireName}.bpkg` } as unknown as File;

    const result = await uploadAndInstallFile(
      questionnaireName,
      "2022-12-31",
      "2022-12-31",
      file,
      setUploading,
      setUploadStatus,
      vi.fn(),
    );

    expect(result).toEqual(false);
    expect(setUploadStatus).toHaveBeenCalledWith(
      "Failed to store Totalmobile release date specified",
    );
    expect(setUploading).toHaveBeenCalledWith(false);
  });
});
