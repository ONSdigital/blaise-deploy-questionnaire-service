import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type AxiosProgressEvent } from "axios";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import React from "react";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";

import { questionnaireList } from "../../features/step_definitions/helpers/api.mock";
import {
  clickContinue,
  navigatePastSettingToStartDateAndDeployQuestionnaire,
  navigateToDeployPageAndSelectFile,
} from "../../features/step_definitions/helpers/functions";
import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import flushPromises from "../../test-utils/flushPromises";
import { createWrapper } from "../../test-utils/renderWithQueryClient";

import DeployPage from "./deployQuestionnairePage";

import type {
  ExistenceCheckResult,
  SettingsCheckResult,
} from "../../api/processes/uploadQuestionnaire";
import type { Questionnaire, QuestionnaireSettings } from "blaise-api-node-client";

type ValidateSelectedQuestionnaireExists = (file: File) => Promise<ExistenceCheckResult>;

type UploadAndInstallFile = (
  questionnaireName: string,
  toStartDate: string | undefined,
  tmReleaseDate: string | undefined,
  file: File,
  onFileUploadProgress: (progressEvent: AxiosProgressEvent) => void,
) => Promise<{ success: true } | { success: false; message: string }>;

type CheckQuestionnaireSettings = (questionnaireName: string) => Promise<SettingsCheckResult>;

type ActivateQuestionnaire = (questionnaireName: string) => Promise<boolean>;
type DeleteQuestionnaire = (questionnaireName: string) => Promise<boolean>;
type ShouldAskToStartDate = (questionnaireName: string) => boolean;
type ShouldAskTmReleaseDate = (questionnaireName: string) => boolean;

type ProcessesApiModule = {
  validateSelectedQuestionnaireExists: ValidateSelectedQuestionnaireExists;
  uploadAndInstallFile: UploadAndInstallFile;
  checkQuestionnaireSettings: CheckQuestionnaireSettings;
};

type QuestionnairesApiModule = {
  activateQuestionnaire: ActivateQuestionnaire;
  deleteQuestionnaire: DeleteQuestionnaire;
};

type DeploymentDateQuestionRulesModule = {
  shouldAskToStartDate: ShouldAskToStartDate;
  shouldAskTmReleaseDate: ShouldAskTmReleaseDate;
};

type SelectFileProps = {
  file: File | undefined;
  setFile: (file: File | undefined) => void;
  loading: boolean;
};

type SelectFileModule = {
  SelectFile: (props: SelectFileProps) => React.ReactElement;
};

type QuestionnaireNameProps = {
  questionnaireName: string;
};

type QuestionnaireExistsModule = {
  QuestionnaireExists: (props: QuestionnaireNameProps) => React.ReactElement;
};

type ConfirmOverrideModule = {
  ConfirmOverride: (props: QuestionnaireNameProps) => React.ReactElement;
};

type AskToStartDateModule = {
  AskToStartDate: (props: QuestionnaireNameProps) => React.ReactElement;
};

type AskTmReleaseDateModule = {
  AskTmReleaseDate: (props: QuestionnaireNameProps) => React.ReactElement;
};

type DeploymentSummaryProps = {
  file: File | undefined;
  foundQuestionnaire: Questionnaire | null;
};

type DeploymentSummaryModule = {
  DeploymentSummary: (props: DeploymentSummaryProps) => React.ReactElement;
};

type InvalidSettingsProps = {
  questionnaireName: string;
  questionnaireSettings: QuestionnaireSettings | undefined;
  invalidSettings: Partial<QuestionnaireSettings>;
  errored: boolean;
};

type InvalidSettingsModule = {
  InvalidSettings: (props: InvalidSettingsProps) => React.ReactElement;
};

type DeploymentOutcomeProps = {
  questionnaireName: string;
  status: string;
  onViewQuestionnaires: () => void;
  onRetry?: () => void;
  retryLabel?: string;
};

type DeploymentOutcomeModule = {
  DeploymentOutcome: (props: DeploymentOutcomeProps) => React.ReactElement;
};

const coverageState = vi.hoisted(() => ({
  enabled: false,
  fileName: "IPS2409A.bpkg",
}));

const processCoverageMocks = vi.hoisted(() => ({
  validateSelectedQuestionnaireExists: vi.fn<ValidateSelectedQuestionnaireExists>(),
  uploadAndInstallFile: vi.fn<UploadAndInstallFile>(),
  checkQuestionnaireSettings: vi.fn<CheckQuestionnaireSettings>(),
}));

const questionnaireApiCoverageMocks = vi.hoisted(() => ({
  activateQuestionnaire: vi.fn<ActivateQuestionnaire>(),
  deleteQuestionnaire: vi.fn<DeleteQuestionnaire>(),
}));

const ruleCoverageMocks = vi.hoisted(() => ({
  shouldAskToStartDate: vi.fn<ShouldAskToStartDate>(),
  shouldAskTmReleaseDate: vi.fn<ShouldAskTmReleaseDate>(),
}));

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

vi.mock("../../api/processes", async () => {
  const actual = await vi.importActual<ProcessesApiModule>("../../api/processes");

  return {
    ...actual,
    validateSelectedQuestionnaireExists: vi.fn(
      (...args: Parameters<ValidateSelectedQuestionnaireExists>) =>
        coverageState.enabled
          ? processCoverageMocks.validateSelectedQuestionnaireExists(...args)
          : actual.validateSelectedQuestionnaireExists(...args),
    ),
    uploadAndInstallFile: vi.fn((...args: Parameters<UploadAndInstallFile>) =>
      coverageState.enabled
        ? processCoverageMocks.uploadAndInstallFile(...args)
        : actual.uploadAndInstallFile(...args),
    ),
    checkQuestionnaireSettings: vi.fn((...args: Parameters<CheckQuestionnaireSettings>) =>
      coverageState.enabled
        ? processCoverageMocks.checkQuestionnaireSettings(...args)
        : actual.checkQuestionnaireSettings(...args),
    ),
  };
});

vi.mock("../../api/questionnaires", async () => {
  const actual = await vi.importActual<QuestionnairesApiModule>("../../api/questionnaires");

  return {
    ...actual,
    activateQuestionnaire: vi.fn((...args: Parameters<ActivateQuestionnaire>) =>
      coverageState.enabled
        ? questionnaireApiCoverageMocks.activateQuestionnaire(...args)
        : actual.activateQuestionnaire(...args),
    ),
    deleteQuestionnaire: vi.fn((...args: Parameters<DeleteQuestionnaire>) =>
      coverageState.enabled
        ? questionnaireApiCoverageMocks.deleteQuestionnaire(...args)
        : actual.deleteQuestionnaire(...args),
    ),
  };
});

vi.mock("../../utils/deploymentDateQuestionRules", async () => {
  const actual = await vi.importActual<DeploymentDateQuestionRulesModule>(
    "../../utils/deploymentDateQuestionRules",
  );

  return {
    ...actual,
    shouldAskToStartDate: vi.fn((...args: Parameters<ShouldAskToStartDate>) =>
      coverageState.enabled
        ? ruleCoverageMocks.shouldAskToStartDate(...args)
        : actual.shouldAskToStartDate(...args),
    ),
    shouldAskTmReleaseDate: vi.fn((...args: Parameters<ShouldAskTmReleaseDate>) =>
      coverageState.enabled
        ? ruleCoverageMocks.shouldAskTmReleaseDate(...args)
        : actual.shouldAskTmReleaseDate(...args),
    ),
  };
});

vi.mock("./sections/selectFile", async () => {
  const actual = await vi.importActual<SelectFileModule>("./sections/selectFile");
  const ActualSelectFile = actual.SelectFile;

  return {
    ...actual,
    SelectFile: (props: React.ComponentProps<typeof ActualSelectFile>) => {
      if (!coverageState.enabled) {
        return <ActualSelectFile {...props} />;
      }

      return (
        <div>
          <div>{props.file?.name ?? "No mocked file"}</div>
          <button
            type="button"
            onClick={() => {
              props.setFile(
                new File(["content"], coverageState.fileName, {
                  type: "application/octet-stream",
                }),
              );
            }}
          >
            Pick mock file
          </button>
        </div>
      );
    },
  };
});

vi.mock("./sections/questionnaireExists", async () => {
  const actual = await vi.importActual<QuestionnaireExistsModule>("./sections/questionnaireExists");
  const ActualQuestionnaireExists = actual.QuestionnaireExists;

  return {
    ...actual,
    QuestionnaireExists: (props: React.ComponentProps<typeof ActualQuestionnaireExists>) => {
      if (!coverageState.enabled) {
        return <ActualQuestionnaireExists {...props} />;
      }

      return <div>Questionnaire exists for {props.questionnaireName}</div>;
    },
  };
});

vi.mock("./sections/confirmOverride", async () => {
  const actual = await vi.importActual<ConfirmOverrideModule>("./sections/confirmOverride");
  const ActualConfirmOverride = actual.ConfirmOverride;

  return {
    ...actual,
    ConfirmOverride: (props: React.ComponentProps<typeof ActualConfirmOverride>) => {
      if (!coverageState.enabled) {
        return <ActualConfirmOverride {...props} />;
      }

      return <div>Confirm override for {props.questionnaireName}</div>;
    },
  };
});

vi.mock("../shared/dateQuestions/askToStartDate", async () => {
  const actual = await vi.importActual<AskToStartDateModule>(
    "../shared/dateQuestions/askToStartDate",
  );
  const ActualAskToStartDate = actual.AskToStartDate;

  return {
    ...actual,
    AskToStartDate: (props: React.ComponentProps<typeof ActualAskToStartDate>) => {
      if (!coverageState.enabled) {
        return <ActualAskToStartDate {...props} />;
      }

      return (
        <div>
          Would you like to set a Telephone Operations start date for questionnaire{" "}
          {props.questionnaireName}?
        </div>
      );
    },
  };
});

vi.mock("../shared/dateQuestions/askTmReleaseDate", async () => {
  const actual = await vi.importActual<AskTmReleaseDateModule>(
    "../shared/dateQuestions/askTmReleaseDate",
  );
  const ActualAskTmReleaseDate = actual.AskTmReleaseDate;

  return {
    ...actual,
    AskTmReleaseDate: (props: React.ComponentProps<typeof ActualAskTmReleaseDate>) => {
      if (!coverageState.enabled) {
        return <ActualAskTmReleaseDate {...props} />;
      }

      return (
        <div>
          Would you like to set a Totalmobile release date for questionnaire{" "}
          {props.questionnaireName}?
        </div>
      );
    },
  };
});

vi.mock("./sections/deploymentSummary", async () => {
  const actual = await vi.importActual<DeploymentSummaryModule>("./sections/deploymentSummary");
  const ActualDeploymentSummary = actual.DeploymentSummary;

  return {
    ...actual,
    DeploymentSummary: (props: React.ComponentProps<typeof ActualDeploymentSummary>) => {
      if (!coverageState.enabled) {
        return <ActualDeploymentSummary {...props} />;
      }

      return <div>Deployment summary</div>;
    },
  };
});

vi.mock("./sections/invalidSettings", async () => {
  const actual = await vi.importActual<InvalidSettingsModule>("./sections/invalidSettings");
  const ActualInvalidSettings = actual.InvalidSettings;

  return {
    ...actual,
    InvalidSettings: (props: React.ComponentProps<typeof ActualInvalidSettings>) => {
      if (!coverageState.enabled) {
        return <ActualInvalidSettings {...props} />;
      }

      return <div>Invalid settings</div>;
    },
  };
});

vi.mock("../shared/deploymentOutcome", async () => {
  const actual = await vi.importActual<DeploymentOutcomeModule>("../shared/deploymentOutcome");
  const ActualDeploymentOutcome = actual.DeploymentOutcome;

  return {
    ...actual,
    DeploymentOutcome: (props: React.ComponentProps<typeof ActualDeploymentOutcome>) => {
      if (!coverageState.enabled) {
        return <ActualDeploymentOutcome {...props} />;
      }

      return (
        <div>
          <div>Outcome questionnaire: {props.questionnaireName}</div>
          <div>Outcome status: {props.status}</div>
          <button
            type="button"
            onClick={props.onRetry}
          >
            {props.retryLabel}
          </button>
          <button
            type="button"
            onClick={props.onViewQuestionnaires}
          >
            View questionnaires
          </button>
        </div>
      );
    },
  };
});

MockAuthenticate.OverrideReturnValues(null, true);

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

afterEach(() => {
  coverageState.enabled = false;
});

function defaultShouldAskToStartDate(questionnaireName: string): boolean {
  return ["DST", "LMS", "OPN"].some((tla) => questionnaireName.startsWith(tla));
}

function defaultShouldAskTmReleaseDate(questionnaireName: string): boolean {
  return ["DST", "LMS"].some((tla) => questionnaireName.startsWith(tla));
}

function currentQuestionnaireName(): string {
  return coverageState.fileName.replace(/\.[a-zA-Z]*$/, "");
}

function mockQuestionnaireMissing(questionnaireName = currentQuestionnaireName()): void {
  processCoverageMocks.validateSelectedQuestionnaireExists.mockImplementation(
    async (): Promise<ExistenceCheckResult> => ({ outcome: "new", questionnaireName }),
  );
}

function mockQuestionnaireExists(foundQuestionnaire: { status?: string; hasData: boolean }): void {
  processCoverageMocks.validateSelectedQuestionnaireExists.mockImplementation(
    async (): Promise<ExistenceCheckResult> => ({
      outcome: "exists",
      questionnaireName: currentQuestionnaireName(),
      questionnaire: foundQuestionnaire as unknown as Questionnaire,
    }),
  );
}

function renderCoverageDeployPage() {
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

describe("Upload Page", () => {
  beforeEach(() => {
    coverageState.enabled = false;
    mock.onGet("/api/questionnaires").reply(200, questionnaireList);
  });

  afterEach(() => {
    mock.reset();
  });

  it("select file page matches Snapshot", async () => {
    const wrapper = render(<DeployPage />, { wrapper: createWrapper(BrowserRouter) });

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });

  it("should render correctly", async () => {
    const { getByText, queryByText } = render(<DeployPage />, {
      wrapper: createWrapper(BrowserRouter),
    });

    await waitFor(() => {
      expect(getByText(/Deploy questionnaire/i)).toBeDefined();
      expect(getByText(/Select questionnaire package/i)).toBeDefined();
      expect(queryByText(/Table of questionnaires/i)).not.toBeInTheDocument();
    });
  });

  it("should disable continue until a file is selected", async () => {
    render(<DeployPage />, { wrapper: createWrapper(BrowserRouter) });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Continue/i })).toBeDisabled();
    });
  });

  it("should keep continue disabled for non-.bpkg files", async () => {
    render(<DeployPage />, { wrapper: createWrapper(BrowserRouter) });

    const input = screen.getByLabelText(/Select questionnaire package/i);
    const file = new File(["(⌐□_□)"], "OPN2004A.pdf", { type: "application/pdf" });

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Continue/i })).toBeDisabled();
    });
  });

  it("should enable continue once a .bpkg file is selected", async () => {
    render(<DeployPage />, { wrapper: createWrapper(BrowserRouter) });

    const input = screen.getByLabelText(/Select questionnaire package/i);
    const file = new File(["test"], "OPN2004A.bpkg", { type: "application/octet-stream" });

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Continue/i })).toBeEnabled();
    });
  });

  it("should disable continue on Telephone Operations start date step until an option is selected", async () => {
    mock.onGet("/api/questionnaires/OPN2004A").reply(200, null);

    render(<DeployPage />, { wrapper: createWrapper(BrowserRouter) });

    const input = screen.getByLabelText(/Select questionnaire package/i);
    const file = new File(["test"], "OPN2004A.bpkg", { type: "application/octet-stream" });

    await userEvent.upload(input, file);
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Would you like to set a Telephone Operations start date/i),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Continue/i })).toBeDisabled();
    });

    await userEvent.click(screen.getByLabelText(/No start date/i));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Continue/i })).toBeEnabled();
    });
  });

  it("should disable continue on Totalmobile release date step until an option is selected", async () => {
    mock.onGet("/api/questionnaires/LMS2207T").reply(200, null);

    render(<DeployPage />, { wrapper: createWrapper(BrowserRouter) });

    const input = screen.getByLabelText(/Select questionnaire package/i);
    const file = new File(["test"], "LMS2207T.bpkg", { type: "application/octet-stream" });

    await userEvent.upload(input, file);
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Would you like to set a Telephone Operations start date/i),
      ).toBeInTheDocument();
    });

    await userEvent.click(screen.getByLabelText(/No start date/i));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Would you like to set a Totalmobile release date/i),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Continue/i })).toBeDisabled();
    });

    await userEvent.click(screen.getByLabelText(/No release date/i));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Continue/i })).toBeEnabled();
    });
  });

  it("should ask both date questions for DST questionnaires", async () => {
    mock.onGet("/api/questionnaires/DST2207T").reply(200, null);

    render(<DeployPage />, { wrapper: createWrapper(BrowserRouter) });

    const input = screen.getByLabelText(/Select questionnaire package/i);
    const file = new File(["test"], "DST2207T.bpkg", { type: "application/octet-stream" });

    await userEvent.upload(input, file);
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Would you like to set a Telephone Operations start date/i),
      ).toBeInTheDocument();
    });

    await userEvent.click(screen.getByLabelText(/No start date/i));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Would you like to set a Totalmobile release date/i),
      ).toBeInTheDocument();
    });
  });

  it("should ask only Telephone Operations start date for OPN questionnaires", async () => {
    mock.onGet("/api/questionnaires/OPN2207T").reply(200, null);

    render(<DeployPage />, { wrapper: createWrapper(BrowserRouter) });

    const input = screen.getByLabelText(/Select questionnaire package/i);
    const file = new File(["test"], "OPN2207T.bpkg", { type: "application/octet-stream" });

    await userEvent.upload(input, file);
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Would you like to set a Telephone Operations start date/i),
      ).toBeInTheDocument();
    });

    await userEvent.click(screen.getByLabelText(/No start date/i));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Deployment summary/i)).toBeInTheDocument();
      expect(
        screen.queryByText(/Would you like to set a Totalmobile release date/i),
      ).not.toBeInTheDocument();
    });
  });
});

describe("Given the file fails to upload", () => {
  beforeEach(() => {
    coverageState.enabled = false;
    mock.onPut("https://storage.googleapis.com/upload").reply(500, {});
    mock
      .onGet("/upload/init?filename=OPN2004A.bpkg")
      .reply(200, "https://storage.googleapis.com/upload");
    mock.onGet("/upload/verify?filename=OPN2004A.bpkg").reply(200, { name: "OPN2004A.bpkg" });
    mock.onGet("/api/questionnaires").reply(200, questionnaireList);
    mock.onGet("/api/questionnaires/OPN2004A").reply(200, null);
    mock.onPost("/api/tostartdate/OPN2004A").reply(201);
  });

  afterEach(() => {
    mock.reset();
  });

  it("it should redirect to the summary page with an error", async () => {
    await navigateToDeployPageAndSelectFile();
    await clickContinue();

    await navigatePastSettingToStartDateAndDeployQuestionnaire();

    await waitFor(() => {
      expect(
        screen.getAllByText((_, element) => {
          const text = (element?.textContent ?? "").replace(/\s+/g, " ").toLowerCase();

          return text.includes("deploy failed");
        }).length,
      ).toBeGreaterThan(0);
      expect(screen.getByText(/Details: Failed to upload questionnaire/i)).toBeDefined();
    });
  });
});

describe("DeployPage coverage paths", () => {
  beforeEach(() => {
    coverageState.enabled = true;
    coverageState.fileName = "IPS2409A.bpkg";
    MockAuthenticate.OverrideReturnValues(null, true);

    processCoverageMocks.validateSelectedQuestionnaireExists.mockReset();
    processCoverageMocks.uploadAndInstallFile.mockReset();
    processCoverageMocks.checkQuestionnaireSettings.mockReset();
    questionnaireApiCoverageMocks.activateQuestionnaire.mockReset();
    questionnaireApiCoverageMocks.deleteQuestionnaire.mockReset();
    ruleCoverageMocks.shouldAskToStartDate.mockReset();
    ruleCoverageMocks.shouldAskTmReleaseDate.mockReset();

    ruleCoverageMocks.shouldAskToStartDate.mockImplementation(defaultShouldAskToStartDate);
    ruleCoverageMocks.shouldAskTmReleaseDate.mockImplementation(defaultShouldAskTmReleaseDate);
    questionnaireApiCoverageMocks.activateQuestionnaire.mockResolvedValue(true);
    questionnaireApiCoverageMocks.deleteQuestionnaire.mockResolvedValue(true);
    processCoverageMocks.uploadAndInstallFile.mockResolvedValue({ success: false, message: "" });
    processCoverageMocks.checkQuestionnaireSettings.mockResolvedValue({ outcome: "valid" });

    mockQuestionnaireMissing();
  });

  it("returns early when the form is submitted without a file", async () => {
    renderCoverageDeployPage();

    await act(async () => {
      fireEvent.submit(document.getElementById("formID") as HTMLFormElement);
    });

    expect(processCoverageMocks.validateSelectedQuestionnaireExists).not.toHaveBeenCalled();
    expect(screen.getByText("No mocked file")).toBeInTheDocument();
  });

  it("cancels from the first step without uninstalling anything", async () => {
    renderCoverageDeployPage();

    await userEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Questionnaires home/i })).toBeInTheDocument();
    });

    expect(questionnaireApiCoverageMocks.deleteQuestionnaire).not.toHaveBeenCalled();
  });

  it("goes straight to the summary when no date questions are required", async () => {
    ruleCoverageMocks.shouldAskToStartDate.mockReturnValue(false);
    ruleCoverageMocks.shouldAskTmReleaseDate.mockReturnValue(false);

    renderCoverageDeployPage();

    await goToSummary();
  });

  it("falls back to the summary when the tm-release-date step no longer applies", async () => {
    coverageState.fileName = "ABC2207T.bpkg";
    let tmReleaseDateCallCount = 0;

    ruleCoverageMocks.shouldAskToStartDate.mockReturnValue(false);
    ruleCoverageMocks.shouldAskTmReleaseDate.mockImplementation(() => {
      tmReleaseDateCallCount += 1;

      return tmReleaseDateCallCount === 1;
    });
    mockQuestionnaireMissing("ABC2207T");

    renderCoverageDeployPage();

    await goToSummary();
  });

  it("shows the live warning and returns to the questionnaire table when accepted", async () => {
    mockQuestionnaireExists({ status: "Active", hasData: true });
    const { invalidateQueriesSpy } = renderCoverageDeployPage();

    await pickMockFile();
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Questionnaire exists for IPS2409A/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/You cannot overwrite a questionnaire that is currently live/i),
      ).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /View questionnaires/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Questionnaires home/i })).toBeInTheDocument();
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["questionnaires"] });
  });

  it("shows upload progress and lets the user view questionnaires from the outcome", async () => {
    ruleCoverageMocks.shouldAskToStartDate.mockReturnValue(false);
    ruleCoverageMocks.shouldAskTmReleaseDate.mockReturnValue(false);

    let finishUpload: (() => void) | undefined;

    processCoverageMocks.uploadAndInstallFile.mockImplementation(
      (
        _questionnaireName: string,
        _toStartDate: string | undefined,
        _tmReleaseDate: string | undefined,
        _file: File,
        onFileUploadProgress: (progressEvent: AxiosProgressEvent) => void,
      ) =>
        new Promise<{ success: true } | { success: false; message: string }>((resolve) => {
          onFileUploadProgress({
            loaded: 5,
            total: 10,
            bytes: 5,
            lengthComputable: true,
          } as AxiosProgressEvent);
          onFileUploadProgress({
            loaded: 5,
            bytes: 5,
            lengthComputable: false,
          } as AxiosProgressEvent);
          finishUpload = () => {
            resolve({ success: false, message: "Upload failed" });
          };
        }),
    );

    const { invalidateQueriesSpy } = renderCoverageDeployPage();

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
    processCoverageMocks.validateSelectedQuestionnaireExists.mockImplementation(
      async (): Promise<ExistenceCheckResult> => ({
        outcome: "error",
        message: "Failed to validate if questionnaire already exists",
      }),
    );

    renderCoverageDeployPage();

    await pickMockFile();
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Outcome status: Failed to validate if questionnaire already exists/i),
      ).toBeInTheDocument();
    });
  });

  it("shows invalid settings and uninstalls the questionnaire when cancel is clicked", async () => {
    ruleCoverageMocks.shouldAskToStartDate.mockReturnValue(false);
    ruleCoverageMocks.shouldAskTmReleaseDate.mockReturnValue(false);
    processCoverageMocks.uploadAndInstallFile.mockResolvedValue({ success: true });
    processCoverageMocks.checkQuestionnaireSettings.mockResolvedValue({
      outcome: "invalid",
      settings: {} as QuestionnaireSettings,
      invalidSettings: {},
    });

    renderCoverageDeployPage();

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

    expect(questionnaireApiCoverageMocks.deleteQuestionnaire).toHaveBeenCalledWith("IPS2409A");
  });

  it("shows the invalid settings page when checking settings returns an error outcome", async () => {
    ruleCoverageMocks.shouldAskToStartDate.mockReturnValue(false);
    ruleCoverageMocks.shouldAskTmReleaseDate.mockReturnValue(false);
    processCoverageMocks.uploadAndInstallFile.mockResolvedValue({ success: true });
    processCoverageMocks.checkQuestionnaireSettings.mockResolvedValue({ outcome: "error" });

    renderCoverageDeployPage();

    await goToSummary();
    await userEvent.click(screen.getByRole("button", { name: /Deploy questionnaire/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid settings")).toBeInTheDocument();
    });
  });
});
