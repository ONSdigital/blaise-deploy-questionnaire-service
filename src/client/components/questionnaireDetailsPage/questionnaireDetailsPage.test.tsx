import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("./sections/blaiseNodeStates", () => ({ BlaiseNodeStates: () => null }));
vi.mock("./sections/cawiModeDetails", () => ({ CawiModeDetails: () => null }));
vi.mock("./sections/catiModeDetails", () => ({ CatiModeDetails: () => null }));
vi.mock("./sections/yearCalendar", () => ({ YearCalendar: () => null }));
vi.mock("./sections/questionnaireSettings", () => ({ QuestionnaireSettings: () => null }));
vi.mock("./sections/questionnaireDetails", () => ({ QuestionnaireDetails: () => null }));
vi.mock("./sections/createDonorCases", () => ({ CreateDonorCases: () => null }));
vi.mock("./sections/createDonorCasesSummary", () => ({ CreateDonorCasesSummary: () => null }));
vi.mock("./sections/reissueNewDonorCase", () => ({ ReissueNewDonorCase: () => null }));
vi.mock("./sections/reissueNewDonorCaseSummary", () => ({
  ReissueNewDonorCaseSummary: () => null,
}));

import { getQuestionnaire, getQuestionnaireModes, getSurveyDays } from "../../api/questionnaires";
import { getTmReleaseDate } from "../../api/tmReleaseDate";
import { createWrapper } from "../../test-utils/renderWithQueryClient";

import QuestionnaireDetailsPage from "./questionnaireDetailsPage";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("../../api/questionnaires", () => ({
  getQuestionnaire: vi.fn(),
  getQuestionnaireModes: vi.fn(),
  getSurveyDays: vi.fn(),
}));

vi.mock("../../api/tmReleaseDate", () => ({
  getTmReleaseDate: vi.fn(),
}));

const mockInfo = vi.fn();
const mockError = vi.fn();

vi.mock("../../utils/logger", () => ({
  clientLogger: {
    info: (...args: unknown[]) => mockInfo(...args),
    error: (...args: unknown[]) => mockError(...args),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

function renderAt(pathname: string, state?: unknown) {
  return render(
    <MemoryRouter initialEntries={[{ pathname, state }]}>
      <Routes>
        <Route
          path="/questionnaire/:questionnaireName"
          element={<QuestionnaireDetailsPage />}
        />
      </Routes>
    </MemoryRouter>,
    { wrapper: createWrapper() },
  );
}

const questionnaireFixture: Questionnaire = {
  name: "OPN2004A",
  dataRecordCount: 1,
  installDate: "2024-01-01T00:00:00.000Z",
  serverParkName: "gusty",
};

describe("QuestionnaireDetailsPage logging", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("logs when questionnaire loads", async () => {
    vi.mocked(getQuestionnaire).mockResolvedValue(questionnaireFixture);
    vi.mocked(getQuestionnaireModes).mockResolvedValue(["CAWI"]);

    renderAt("/questionnaire/OPN2004A", undefined);

    await waitFor(() => {
      expect(mockInfo).toHaveBeenCalledWith("Loaded questionnaire: OPN2004A");
    });
  });

  it("logs when questionnaire modes are empty", async () => {
    vi.mocked(getQuestionnaire).mockResolvedValue(questionnaireFixture);
    vi.mocked(getQuestionnaireModes).mockResolvedValue([]);

    renderAt("/questionnaire/OPN2004A", undefined);

    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith("returned questionnaire mode was empty");
    });

    expect(screen.getByText(/Failed to get questionnaire details/i)).toBeDefined();
  });

  it("logs when CATI survey days are returned", async () => {
    vi.mocked(getQuestionnaire).mockResolvedValue(questionnaireFixture);
    vi.mocked(getQuestionnaireModes).mockResolvedValue(["CATI"]);
    vi.mocked(getSurveyDays).mockResolvedValue(["Monday"]);

    renderAt("/questionnaire/OPN2004A", undefined);

    await waitFor(() => {
      expect(mockInfo).toHaveBeenCalledWith("returned questionnaire survey days: Monday");
    });
  });

  it("logs when questionnaire load fails", async () => {
    vi.mocked(getQuestionnaire).mockRejectedValue(new Error("nope"));
    vi.mocked(getQuestionnaireModes).mockResolvedValue(["CAWI"]);

    renderAt("/questionnaire/OPN2004A", undefined);

    await waitFor(() => {
      expect(mockInfo).toHaveBeenCalled();
    });

    expect(screen.getByText(/Failed to get questionnaire details/i)).toBeDefined();
  });
});

describe("QuestionnaireDetailsPage Totalmobile release date details", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders LMS questionnaire details when the Totalmobile release date is invalid", async () => {
    const lmsQuestionnaireFixture: Questionnaire = {
      name: "LMS2101_AA1",
      dataRecordCount: 1,
      installDate: "2024-01-01T00:00:00.000Z",
      serverParkName: "gusty",
    };

    vi.mocked(getQuestionnaire).mockResolvedValue(lmsQuestionnaireFixture);
    vi.mocked(getQuestionnaireModes).mockResolvedValue(["CAWI"]);
    vi.mocked(getSurveyDays).mockResolvedValue([]);
    vi.mocked(getTmReleaseDate).mockResolvedValue("not-a-date");

    renderAt("/questionnaire/LMS2101_AA1");

    expect(await screen.findByRole("heading", { name: "LMS2101_AA1" })).toBeDefined();
    expect(await screen.findByText("not-a-date")).toBeDefined();
    expect(screen.getByText("Totalmobile release date")).toBeDefined();
    expect(screen.queryByText(/Could not get questionnaire details/i)).toBeNull();
  });
});
