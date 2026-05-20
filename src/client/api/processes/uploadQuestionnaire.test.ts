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

  it("returns error outcome when checking questionnaire existence throws", async () => {
    vi.mocked(getQuestionnaire).mockRejectedValue(new Error("boom"));

    const result = await validateSelectedQuestionnaireExists({ name: "OPN2004A.bpkg" } as File);

    expect(result.outcome).toBe("error");
    if (result.outcome === "error") {
      expect(result.message).toBe("Failed to validate if questionnaire already exists");
    }
  });

  it("returns exists outcome when the questionnaire already exists", async () => {
    const questionnaire = { name: "OPN2004A" };

    vi.mocked(getQuestionnaire).mockResolvedValue(questionnaire as never);

    const result = await validateSelectedQuestionnaireExists({ name: "OPN2004A.bpkg" } as File);

    expect(result.outcome).toBe("exists");
    if (result.outcome === "exists") {
      expect(result.questionnaireName).toBe("OPN2004A");
      expect(result.questionnaire).toBe(questionnaire);
    }
  });

  it("returns new outcome when the questionnaire does not exist", async () => {
    vi.mocked(getQuestionnaire).mockResolvedValue(undefined as never);

    const result = await validateSelectedQuestionnaireExists({ name: "OPN2004A.bpkg" } as File);

    expect(result.outcome).toBe("new");
    if (result.outcome === "new") {
      expect(result.questionnaireName).toBe("OPN2004A");
    }
  });

  it("returns failure when initialise upload fails", async () => {
    vi.mocked(initialiseUpload).mockRejectedValue(new Error("boom"));

    const result = await uploadAndInstallFile(
      "IPS2004A",
      undefined,
      undefined,
      { name: "IPS2004A.bpkg" } as File,
      vi.fn(),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toBe("Failed to upload questionnaire");
    }
  });

  it("surfaces the install verification message when upload succeeds but installation does not", async () => {
    const questionnaireName = `${tmReleaseDateSurveyTlas[0] || "LMS"}2004A`;

    vi.mocked(initialiseUpload).mockResolvedValue("https://storage.googleapis.com/upload");
    vi.mocked(uploadFile).mockResolvedValue(true);
    vi.mocked(verifyAndInstallQuestionnaire).mockResolvedValue([false, "Install failed"]);

    const result = await uploadAndInstallFile(
      questionnaireName,
      "2022-12-31",
      "2022-12-31",
      { name: `${questionnaireName}.bpkg` } as File,
      vi.fn(),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toBe("Install failed");
    }

    expect(setToStartDate).not.toHaveBeenCalled();
    expect(setTmReleaseDate).not.toHaveBeenCalled();
  });

  it("handles Totalmobile release date failure", async () => {
    const tla = tmReleaseDateSurveyTlas[0] || "OPN";
    const questionnaireName = `${tla}2004A`;

    vi.mocked(setToStartDate).mockResolvedValue(true);
    vi.mocked(setTmReleaseDate).mockResolvedValue(false);
    vi.mocked(initialiseUpload).mockResolvedValue("https://storage.googleapis.com/upload");
    vi.mocked(uploadFile).mockResolvedValue(true);
    vi.mocked(verifyAndInstallQuestionnaire).mockResolvedValue([true, "ok"]);

    const file = { name: `${questionnaireName}.bpkg` } as unknown as File;

    const result = await uploadAndInstallFile(
      questionnaireName,
      "2022-12-31",
      "2022-12-31",
      file,
      vi.fn(),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toBe("Failed to store Totalmobile release date");
    }
  });

  it("stores only the start date for questionnaires that do not require a Totalmobile release date", async () => {
    const questionnaireName = "OPN2004A"; // OPN: shouldAskToStartDate=true, shouldAskTmReleaseDate=false

    vi.mocked(setToStartDate).mockResolvedValue(true);
    vi.mocked(initialiseUpload).mockResolvedValue("https://storage.googleapis.com/upload");
    vi.mocked(uploadFile).mockResolvedValue(true);
    vi.mocked(verifyAndInstallQuestionnaire).mockResolvedValue([true, "ok"]);

    const result = await uploadAndInstallFile(
      questionnaireName,
      "2022-12-31",
      undefined,
      { name: `${questionnaireName}.bpkg` } as File,
      vi.fn(),
    );

    expect(result.success).toBe(true);
    expect(setToStartDate).toHaveBeenCalledWith(questionnaireName, "2022-12-31");
    expect(setTmReleaseDate).not.toHaveBeenCalled();
  });

  it("stores deployment dates only after installation succeeds", async () => {
    const questionnaireName = `${tmReleaseDateSurveyTlas[0] || "LMS"}2004A`;

    vi.mocked(setToStartDate).mockResolvedValue(true);
    vi.mocked(setTmReleaseDate).mockResolvedValue(true);
    vi.mocked(initialiseUpload).mockResolvedValue("https://storage.googleapis.com/upload");
    vi.mocked(uploadFile).mockResolvedValue(true);
    vi.mocked(verifyAndInstallQuestionnaire).mockResolvedValue([true, "ok"]);

    const result = await uploadAndInstallFile(
      questionnaireName,
      "2022-12-31",
      "2022-12-31",
      { name: `${questionnaireName}.bpkg` } as File,
      vi.fn(),
    );

    expect(result.success).toBe(true);
    expect(vi.mocked(verifyAndInstallQuestionnaire).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(setToStartDate).mock.invocationCallOrder[0]!,
    );
    expect(vi.mocked(setToStartDate).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(setTmReleaseDate).mock.invocationCallOrder[0]!,
    );
  });

  it("succeeds without storing any dates for questionnaires that do not ask for deployment dates", async () => {
    vi.mocked(initialiseUpload).mockResolvedValue("https://storage.googleapis.com/upload");
    vi.mocked(uploadFile).mockResolvedValue(true);
    vi.mocked(verifyAndInstallQuestionnaire).mockResolvedValue([true, "ok"]);

    const result = await uploadAndInstallFile(
      "IPS2004A",
      undefined,
      undefined,
      { name: "IPS2004A.bpkg" } as File,
      vi.fn(),
    );

    expect(result.success).toBe(true);
    expect(setToStartDate).not.toHaveBeenCalled();
    expect(setTmReleaseDate).not.toHaveBeenCalled();
  });

  it("returns error outcome when questionnaire settings or modes are empty", async () => {
    vi.mocked(getQuestionnaireSettings).mockResolvedValue([]);
    vi.mocked(getQuestionnaireModes).mockResolvedValue(["CATI"]);

    const result = await checkQuestionnaireSettings("OPN2004A");

    expect(result.outcome).toBe("error");
  });

  it("returns error outcome when strict interviewing settings are missing", async () => {
    vi.mocked(getQuestionnaireSettings).mockResolvedValue([
      {
        questionnaireName: "OPN2004A",
        type: "FreeInterviewing",
        saveSessionOnTimeout: true,
        saveSessionOnQuit: true,
        deleteSessionOnTimeout: true,
        deleteSessionOnQuit: true,
        applyRecordLocking: true,
      },
    ] as never);
    vi.mocked(getQuestionnaireModes).mockResolvedValue(["CATI"]);

    const result = await checkQuestionnaireSettings("OPN2004A");

    expect(result.outcome).toBe("error");
  });

  it("returns error outcome when loading questionnaire settings throws", async () => {
    vi.mocked(getQuestionnaireSettings).mockRejectedValue(new Error("boom"));

    const result = await checkQuestionnaireSettings("OPN2004A");

    expect(result.outcome).toBe("error");
  });

  it("deactivates the questionnaire when settings validation fails", async () => {
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

    const result = await checkQuestionnaireSettings("OPN2004A");

    expect(result.outcome).toBe("invalid");
    expect(deactivateQuestionnaire).toHaveBeenCalledWith("OPN2004A");
  });

  it("waits for deactivation to finish before returning invalid settings", async () => {
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
    const resultPromise = checkQuestionnaireSettings("OPN2004A").then((result) => {
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

    const result = await resultPromise;

    expect(result.outcome).toBe("invalid");
    expect(resolved).toBe(true);
  });

  it("uses CATI-only validation when the questionnaire only supports CATI mode", async () => {
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

    const result = await checkQuestionnaireSettings("OPN2004A");

    expect(result.outcome).toBe("valid");
    expect(deactivateQuestionnaire).not.toHaveBeenCalled();
  });
});
