import { tmReleaseDateSurveyTlas } from "../../utils/deploymentDateQuestionRules";
import {
  deactivateQuestionnaire,
  getQuestionnaire,
  getQuestionnaireModes,
  getQuestionnaireSettings,
} from "../questionnaires";
import { setTmReleaseDate } from "../tmReleaseDate";
import { setToStartDate } from "../toStartDate";
import { initialiseUpload, uploadFile } from "../upload";

import {
  checkQuestionnaireSettings,
  uploadAndInstallFile,
  validateSelectedQuestionnaireExists,
} from "./uploadQuestionnaire";

import { verifyAndInstallQuestionnaire } from ".";

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

vi.mock("../../utils/logger", () => ({
  clientLogger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("uploadQuestionnaire", () => {
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

  it("returns true when the questionnaire already exists", async () => {
    const questionnaire = { name: "OPN2004A" };
    const setQuestionnaireName = vi.fn();
    const setUploadStatus = vi.fn();
    const setFoundQuestionnaire = vi.fn();

    vi.mocked(getQuestionnaire).mockResolvedValue(questionnaire as never);

    const result = await validateSelectedQuestionnaireExists(
      { name: "OPN2004A.bpkg" } as File,
      setQuestionnaireName,
      setUploadStatus,
      setFoundQuestionnaire,
    );

    expect(result).toBe(true);
    expect(setQuestionnaireName).toHaveBeenCalledWith("OPN2004A");
    expect(setFoundQuestionnaire).toHaveBeenCalledWith(questionnaire);
  });

  it("returns null when checking questionnaire existence throws", async () => {
    const setQuestionnaireName = vi.fn();
    const setUploadStatus = vi.fn();
    const setFoundQuestionnaire = vi.fn();

    vi.mocked(getQuestionnaire).mockRejectedValue(new Error("boom"));

    const result = await validateSelectedQuestionnaireExists(
      { name: "OPN2004A.bpkg" } as File,
      setQuestionnaireName,
      setUploadStatus,
      setFoundQuestionnaire,
    );

    expect(result).toBeNull();
    expect(setUploadStatus).toHaveBeenCalledWith(
      "Failed to validate if questionnaire already exists",
    );
    expect(setFoundQuestionnaire).not.toHaveBeenCalled();
  });

  it("handles initialise upload failure for questionnaires that do not ask date questions", async () => {
    vi.mocked(initialiseUpload).mockRejectedValue(new Error("boom"));

    const setUploading = vi.fn();
    const setUploadStatus = vi.fn();

    const result = await uploadAndInstallFile(
      "IPS2004A",
      undefined,
      undefined,
      { name: "IPS2004A.bpkg" } as File,
      setUploading,
      setUploadStatus,
      vi.fn(),
    );

    expect(result).toBe(false);
    expect(setUploadStatus).toHaveBeenCalledWith("Failed to upload questionnaire");
    expect(setUploading).toHaveBeenCalledWith(false);
  });

  it("surfaces the install verification message when upload succeeds but installation does not", async () => {
    const questionnaireName = `${tmReleaseDateSurveyTlas[0] || "LMS"}2004A`;
    const setUploading = vi.fn();
    const setUploadStatus = vi.fn();

    vi.mocked(setToStartDate).mockResolvedValue(true);
    vi.mocked(setTmReleaseDate).mockResolvedValue(true);
    vi.mocked(initialiseUpload).mockResolvedValue("https://storage.googleapis.com/upload");
    vi.mocked(uploadFile).mockResolvedValue(true);
    vi.mocked(verifyAndInstallQuestionnaire).mockResolvedValue([false, "Install failed"]);

    const result = await uploadAndInstallFile(
      questionnaireName,
      "2022-12-31",
      "2022-12-31",
      { name: `${questionnaireName}.bpkg` } as File,
      setUploading,
      setUploadStatus,
      vi.fn(),
    );

    expect(result).toBe(false);
    expect(setUploadStatus).toHaveBeenCalledWith("Install failed");
    expect(setUploading).toHaveBeenCalledWith(true);
    expect(setUploading).toHaveBeenLastCalledWith(false);
  });

  it("handles Totalmobile release date failure", async () => {
    const tla = tmReleaseDateSurveyTlas[0] || "OPN";
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
    expect(setUploadStatus).toHaveBeenCalledWith("Failed to store Totalmobile release date");
    expect(setUploading).toHaveBeenCalledWith(false);
  });

  it("returns false when questionnaire settings or modes are empty", async () => {
    const setQuestionnaireSettings = vi.fn();
    const setInvalidSettings = vi.fn();
    const setErrored = vi.fn();

    vi.mocked(getQuestionnaireSettings).mockResolvedValue([]);
    vi.mocked(getQuestionnaireModes).mockResolvedValue(["CATI"]);

    const result = await checkQuestionnaireSettings(
      "OPN2004A",
      setQuestionnaireSettings,
      setInvalidSettings,
      setErrored,
    );

    expect(result).toBe(false);
    expect(setErrored).toHaveBeenCalledWith(true);
    expect(setQuestionnaireSettings).not.toHaveBeenCalled();
  });

  it("returns false when loading questionnaire settings throws", async () => {
    const setQuestionnaireSettings = vi.fn();
    const setInvalidSettings = vi.fn();
    const setErrored = vi.fn();

    vi.mocked(getQuestionnaireSettings).mockRejectedValue(new Error("boom"));

    const result = await checkQuestionnaireSettings(
      "OPN2004A",
      setQuestionnaireSettings,
      setInvalidSettings,
      setErrored,
    );

    expect(result).toBe(false);
    expect(setErrored).toHaveBeenCalledWith(true);
  });

  it("deactivates the questionnaire when settings validation fails", async () => {
    const setQuestionnaireSettings = vi.fn();
    const setInvalidSettings = vi.fn();
    const setErrored = vi.fn();

    vi.mocked(getQuestionnaireSettings).mockResolvedValue([
      {
        questionnaireName: "OPN2004A",
        type: "StrictInterviewing",
        askOffSubstitutionQuestions: false,
        askOtherwiseQuestions: false,
        checkQuestions: false,
        keyboardShortcuts: false,
        pause: false,
        allowMovementDuringResponseChange: false,
        useLiveRouting: false,
        totaliserRouting: false,
        applyRecordLocking: false,
      },
    ] as never);
    vi.mocked(getQuestionnaireModes).mockResolvedValue(["MIXED"]);

    const result = await checkQuestionnaireSettings(
      "OPN2004A",
      setQuestionnaireSettings,
      setInvalidSettings,
      setErrored,
    );

    expect(result).toBe(false);
    expect(deactivateQuestionnaire).toHaveBeenCalledWith("OPN2004A");
  });

  it("waits for deactivation to finish before returning invalid settings", async () => {
    const setQuestionnaireSettings = vi.fn();
    const setInvalidSettings = vi.fn();
    const setErrored = vi.fn();
    let resolveSettings:
      | ((value: Awaited<ReturnType<typeof getQuestionnaireSettings>>) => void)
      | undefined;
    let resolveModes:
      | ((value: Awaited<ReturnType<typeof getQuestionnaireModes>>) => void)
      | undefined;
    let resolveDeactivate: ((value: boolean) => void) | undefined;

    vi.mocked(getQuestionnaireSettings).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSettings = resolve;
        }) as never,
    );
    vi.mocked(getQuestionnaireModes).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveModes = resolve;
        }) as never,
    );
    vi.mocked(deactivateQuestionnaire).mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          resolveDeactivate = resolve;
        }) as never,
    );

    let resolved = false;
    const resultPromise = checkQuestionnaireSettings(
      "OPN2004A",
      setQuestionnaireSettings,
      setInvalidSettings,
      setErrored,
    ).then((result) => {
      resolved = true;

      return result;
    });

    resolveSettings?.([
      {
        questionnaireName: "OPN2004A",
        type: "StrictInterviewing",
        askOffSubstitutionQuestions: false,
        askOtherwiseQuestions: false,
        checkQuestions: false,
        keyboardShortcuts: false,
        pause: false,
        allowMovementDuringResponseChange: false,
        useLiveRouting: false,
        totaliserRouting: false,
        applyRecordLocking: false,
      },
    ] as never);

    await Promise.resolve();

    expect(deactivateQuestionnaire).not.toHaveBeenCalled();
    expect(resolved).toBe(false);

    resolveModes?.(["MIXED"] as never);

    await Promise.resolve();

    expect(deactivateQuestionnaire).toHaveBeenCalledWith("OPN2004A");
    expect(resolved).toBe(false);

    resolveDeactivate?.(true);

    await expect(resultPromise).resolves.toBe(false);
    expect(resolved).toBe(true);
  });

  it("uses CATI-only validation when the questionnaire only supports CATI mode", async () => {
    const setQuestionnaireSettings = vi.fn();
    const setInvalidSettings = vi.fn();
    const setErrored = vi.fn();

    vi.mocked(deactivateQuestionnaire).mockResolvedValue(true as never);
    vi.mocked(getQuestionnaireSettings).mockResolvedValue([
      {
        questionnaireName: "OPN2004A",
        type: "StrictInterviewing",
        saveSessionOnTimeout: true,
        saveSessionOnQuit: true,
        useLiveRouting: false,
        applyRecordLocking: true,
      },
    ] as never);
    vi.mocked(getQuestionnaireModes).mockResolvedValue(["CATI"]);

    const result = await checkQuestionnaireSettings(
      "OPN2004A",
      setQuestionnaireSettings,
      setInvalidSettings,
      setErrored,
    );

    expect(result).toBe(true);
    expect(setErrored).not.toHaveBeenCalled();
    expect(setQuestionnaireSettings).toHaveBeenCalledTimes(1);
    expect(setInvalidSettings).toHaveBeenCalledWith({});
    expect(deactivateQuestionnaire).not.toHaveBeenCalled();
  });
});
