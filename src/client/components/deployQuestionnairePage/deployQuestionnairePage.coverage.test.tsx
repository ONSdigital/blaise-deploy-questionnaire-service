import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";

import DeployPage from "./deployQuestionnairePage";

const testState = vi.hoisted(() => ({
  fileName: "IPS2409A.bpkg",
}));

const processMocks = vi.hoisted(() => ({
  validateSelectedQuestionnaireExists: vi.fn(),
  uploadAndInstallFile: vi.fn(),
  checkQuestionnaireSettings: vi.fn(),
}));

const questionnaireApiMocks = vi.hoisted(() => ({
  activateQuestionnaire: vi.fn(),
  deleteQuestionnaire: vi.fn(),
}));

const ruleMocks = vi.hoisted(() => ({
  shouldAskToStartDate: vi.fn(),
  shouldAskTmReleaseDate: vi.fn(),
}));

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

vi.mock("../../api/processes", () => processMocks);

vi.mock("../../api/questionnaires", () => questionnaireApiMocks);

vi.mock("../../utils/deploymentDateQuestionRules", () => ruleMocks);

vi.mock("./sections/selectFile", () => ({
  SelectFile: ({
    file,
    setFile,
  }: {
    file: File | undefined;
    setFile: (file: File | undefined) => void;
  }) => (
    <div>
      <div>{file?.name ?? "No mocked file"}</div>
      <button
        type="button"
        onClick={() => {
          setFile(new File(["content"], testState.fileName, { type: "application/octet-stream" }));
        }}
      >
        Pick mock file
      </button>
    </div>
  ),
}));

vi.mock("./sections/questionnaireExists", () => ({
  QuestionnaireExists: ({ questionnaireName }: { questionnaireName: string }) => (
    <div>Questionnaire exists for {questionnaireName}</div>
  ),
}));

vi.mock("./sections/confirmOverride", () => ({
  ConfirmOverride: ({ questionnaireName }: { questionnaireName: string }) => (
    <div>Confirm override for {questionnaireName}</div>
  ),
}));

vi.mock("../shared/dateQuestions/askStartDate", () => ({
  AskStartDate: ({ questionnaireName }: { questionnaireName: string }) => (
    <div>Ask start date for {questionnaireName}</div>
  ),
}));

vi.mock("../shared/dateQuestions/askReleaseDate", () => ({
  AskReleaseDate: ({ questionnaireName }: { questionnaireName: string }) => (
    <div>Ask release date for {questionnaireName}</div>
  ),
}));

vi.mock("./sections/deploymentSummary", () => ({
  DeploymentSummary: () => <div>Deployment summary</div>,
}));

vi.mock("./sections/invalidSettings", () => ({
  InvalidSettings: () => <div>Invalid settings</div>,
}));

vi.mock("../shared/deploymentOutcome", () => ({
  DeploymentOutcome: ({
    questionnaireName,
    status,
    onRetry,
    retryLabel,
    onViewQuestionnaires,
  }: {
    questionnaireName: string;
    status: string;
    onRetry: () => void;
    retryLabel: string;
    onViewQuestionnaires: () => void;
  }) => (
    <div>
      <div>Outcome questionnaire: {questionnaireName}</div>
      <div>Outcome status: {status}</div>
      <button
        type="button"
        onClick={onRetry}
      >
        {retryLabel}
      </button>
      <button
        type="button"
        onClick={onViewQuestionnaires}
      >
        View questionnaires
      </button>
    </div>
  ),
}));

function defaultShouldAskToStartDate(questionnaireName: string): boolean {
  return ["DST", "LMS", "OPN", "TST"].some((tla) => questionnaireName.startsWith(tla));
}

function defaultShouldAskTmReleaseDate(questionnaireName: string): boolean {
  return ["DST", "LMS"].some((tla) => questionnaireName.startsWith(tla));
}

function currentQuestionnaireName(): string {
  return testState.fileName.replace(/\.[a-zA-Z]*$/, "");
}

function mockQuestionnaireMissing(questionnaireName = currentQuestionnaireName()): void {
  processMocks.validateSelectedQuestionnaireExists.mockImplementation(
    async (_file: File | undefined, setQuestionnaireName: (name: string) => void) => {
      setQuestionnaireName(questionnaireName);

      return false;
    },
  );
}

function mockQuestionnaireExists(foundQuestionnaire: { active: boolean; hasData: boolean }): void {
  processMocks.validateSelectedQuestionnaireExists.mockImplementation(
    async (
      _file: File | undefined,
      setQuestionnaireName: (name: string) => void,
      _setUploadStatus: (status: string) => void,
      setFoundQuestionnaire: (questionnaire: { active: boolean; hasData: boolean }) => void,
    ) => {
      setQuestionnaireName(currentQuestionnaireName());
      setFoundQuestionnaire(foundQuestionnaire);

      return true;
    },
  );
}

function renderDeployPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const invalidateQueriesSpy = vi
    .spyOn(queryClient, "invalidateQueries")
    .mockResolvedValue(undefined as never);

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/deploy"]}>
        <Routes>
          <Route
            path="/deploy"
            element={<DeployPage />}
          />
          <Route
            path="/"
            element={<h1>Questionnaires home</h1>}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

  return { invalidateQueriesSpy };
}

async function pickMockFile(): Promise<void> {
  await userEvent.click(screen.getByRole("button", { name: /Pick mock file/i }));

  await waitFor(() => {
    expect(screen.getByRole("button", { name: /Continue/i })).toBeEnabled();
  });
}

async function goToSummary(): Promise<void> {
  await pickMockFile();
  await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

  await waitFor(() => {
    expect(screen.getByText("Deployment summary")).toBeInTheDocument();
  });
}

describe("DeployPage coverage paths", () => {
  beforeEach(() => {
    testState.fileName = "IPS2409A.bpkg";
    MockAuthenticate.OverrideReturnValues(null, true);

    processMocks.validateSelectedQuestionnaireExists.mockReset();
    processMocks.uploadAndInstallFile.mockReset();
    processMocks.checkQuestionnaireSettings.mockReset();
    questionnaireApiMocks.activateQuestionnaire.mockReset();
    questionnaireApiMocks.deleteQuestionnaire.mockReset();
    ruleMocks.shouldAskToStartDate.mockReset();
    ruleMocks.shouldAskTmReleaseDate.mockReset();

    ruleMocks.shouldAskToStartDate.mockImplementation(defaultShouldAskToStartDate);
    ruleMocks.shouldAskTmReleaseDate.mockImplementation(defaultShouldAskTmReleaseDate);
    questionnaireApiMocks.activateQuestionnaire.mockResolvedValue(true);
    questionnaireApiMocks.deleteQuestionnaire.mockResolvedValue(true);
    processMocks.uploadAndInstallFile.mockResolvedValue(false);
    processMocks.checkQuestionnaireSettings.mockResolvedValue(true);

    mockQuestionnaireMissing();
  });

  it("returns early when the form is submitted without a file", async () => {
    renderDeployPage();

    await act(async () => {
      fireEvent.submit(document.getElementById("formID") as HTMLFormElement);
    });

    expect(processMocks.validateSelectedQuestionnaireExists).not.toHaveBeenCalled();
    expect(screen.getByText("No mocked file")).toBeInTheDocument();
  });

  it("cancels from the first step without uninstalling anything", async () => {
    renderDeployPage();

    await userEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Questionnaires home/i })).toBeInTheDocument();
    });

    expect(questionnaireApiMocks.deleteQuestionnaire).not.toHaveBeenCalled();
  });

  it("goes straight to the summary when no date questions are required", async () => {
    ruleMocks.shouldAskToStartDate.mockReturnValue(false);
    ruleMocks.shouldAskTmReleaseDate.mockReturnValue(false);

    renderDeployPage();

    await goToSummary();
  });

  it("falls back to the summary when the release-date step no longer applies", async () => {
    testState.fileName = "ABC2207T.bpkg";
    let tmReleaseDateCallCount = 0;

    ruleMocks.shouldAskToStartDate.mockReturnValue(false);
    ruleMocks.shouldAskTmReleaseDate.mockImplementation(() => {
      tmReleaseDateCallCount += 1;

      return tmReleaseDateCallCount === 1;
    });
    mockQuestionnaireMissing("ABC2207T");

    renderDeployPage();

    await goToSummary();
  });

  it("shows the live warning and returns to the questionnaire table when accepted", async () => {
    mockQuestionnaireExists({ active: true, hasData: true });
    const { invalidateQueriesSpy } = renderDeployPage();

    await pickMockFile();
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Questionnaire exists for IPS2409A/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/currently live/i)).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole("button", { name: /Accept and go to table of questionnaires/i }),
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Questionnaires home/i })).toBeInTheDocument();
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["questionnaires"] });
  });

  it("shows upload progress and lets the user view questionnaires from the outcome", async () => {
    ruleMocks.shouldAskToStartDate.mockReturnValue(false);
    ruleMocks.shouldAskTmReleaseDate.mockReturnValue(false);

    let finishUpload: (() => void) | undefined;
    processMocks.uploadAndInstallFile.mockImplementation(
      (
        _questionnaireName: string,
        _toStartDate: string | undefined,
        _tmReleaseDate: string | undefined,
        _file: File | undefined,
        setUploading: (uploading: boolean) => void,
        setUploadStatus: (status: string) => void,
        onFileUploadProgress: (event: { loaded: number; total?: number }) => void,
      ) =>
        new Promise<boolean>((resolve) => {
          setUploading(true);
          onFileUploadProgress({ loaded: 5, total: 10 });
          onFileUploadProgress({ loaded: 5 });
          finishUpload = () => {
            setUploadStatus("Upload failed");
            setUploading(false);
            resolve(false);
          };
        }),
    );

    const { invalidateQueriesSpy } = renderDeployPage();

    await goToSummary();
    await userEvent.click(screen.getByRole("button", { name: /Deploy questionnaire/i }));

    await waitFor(() => {
      expect(screen.getByText(/Uploading: 0%/i)).toBeInTheDocument();
    });

    await act(async () => {
      finishUpload?.();
    });

    await waitFor(() => {
      expect(screen.getByText(/Outcome status: Upload failed/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /View questionnaires/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Questionnaires home/i })).toBeInTheDocument();
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["questionnaires"] });
  });

  it("shows the validation failure outcome when questionnaire existence cannot be checked", async () => {
    processMocks.validateSelectedQuestionnaireExists.mockImplementation(
      async (
        _file: File | undefined,
        setQuestionnaireName: (name: string) => void,
        setUploadStatus: (status: string) => void,
      ) => {
        setQuestionnaireName("IPS2409A");
        setUploadStatus("Failed to validate if questionnaire already exists");

        return null;
      },
    );

    renderDeployPage();

    await pickMockFile();
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Outcome status: Failed to validate if questionnaire already exists/i),
      ).toBeInTheDocument();
    });
  });

  it("shows invalid settings and uninstalls the questionnaire when cancel is clicked", async () => {
    ruleMocks.shouldAskToStartDate.mockReturnValue(false);
    ruleMocks.shouldAskTmReleaseDate.mockReturnValue(false);
    processMocks.uploadAndInstallFile.mockResolvedValue(true);
    processMocks.checkQuestionnaireSettings.mockResolvedValue(false);

    renderDeployPage();

    await goToSummary();
    await userEvent.click(screen.getByRole("button", { name: /Deploy questionnaire/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid settings")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /Deploy anyway/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^Cancel$/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Questionnaires home/i })).toBeInTheDocument();
    });

    expect(questionnaireApiMocks.deleteQuestionnaire).toHaveBeenCalledWith("IPS2409A");
  });
});