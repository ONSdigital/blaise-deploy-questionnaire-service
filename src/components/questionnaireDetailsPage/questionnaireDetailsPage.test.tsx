/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import type { Questionnaire } from "blaise-api-node-client";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../breadcrumbs", () => () => null);
vi.mock("./sections/blaiseNodeInfo", () => () => null);
vi.mock("./sections/cawiModeDetails", () => () => null);
vi.mock("./sections/catiModeDetails", () => () => null);
vi.mock("./sections/totalmobileDetails", () => () => null);
vi.mock("./sections/yearCalendar", () => () => null);
vi.mock("./sections/questionnaireSettingsSection", () => () => null);
vi.mock("./sections/questionnaireDetails", () => () => null);
vi.mock("./sections/createDonorCases", () => () => null);
vi.mock("../createDonorCasePage/createDonorCasesSummary", () => () => null);
vi.mock("./sections/reissueNewDonorCase", () => () => null);
vi.mock("../reissueNewDonorCasePage/reissueNewDonorCaseSummary", () => () => null);

import {
  getQuestionnaire,
  getQuestionnaireModes,
  getSurveyDays,
} from "../../client/questionnaires";

import QuestionnaireDetailsPage from "./questionnaireDetailsPage";

vi.mock("../../client/questionnaires", () => ({
  getQuestionnaire: vi.fn(),
  getQuestionnaireModes: vi.fn(),
  getSurveyDays: vi.fn(),
}));

const mockInfo = vi.fn();
const mockError = vi.fn();

vi.mock("../../client/logger", () => ({
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

    expect(screen.getByText(/Could not get questionnaire details/i)).toBeDefined();
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

    expect(screen.getByText(/Could not get questionnaire details/i)).toBeDefined();
  });
});
