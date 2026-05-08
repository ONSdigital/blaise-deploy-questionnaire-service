/**
 * @vitest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import type { Questionnaire } from "blaise-api-node-client";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../breadcrumbs", () => ({ default: () => null }));
vi.mock("./sections/blaiseNodeInfo", () => ({ default: () => null }));
vi.mock("./sections/cawiModeDetails", () => ({ default: () => null }));
vi.mock("./sections/catiModeDetails", () => ({ default: () => null }));
vi.mock("./sections/yearCalendar", () => ({ default: () => null }));
vi.mock("./sections/questionnaireSettingsSection", () => ({ default: () => null }));
vi.mock("./sections/questionnaireDetails", () => ({ default: () => null }));
vi.mock("./sections/createDonorCases", () => ({ default: () => null }));
vi.mock("../createDonorCasePage/createDonorCasesSummary", () => ({ default: () => null }));
vi.mock("./sections/reissueNewDonorCase", () => ({ default: () => null }));
vi.mock("../reissueNewDonorCasePage/reissueNewDonorCaseSummary", () => ({ default: () => null }));

import {
  getQuestionnaire,
  getQuestionnaireModes,
  getSurveyDays,
} from "../../client/questionnaires";
import { getTmReleaseDate } from "../../client/tmReleaseDate";

import QuestionnaireDetailsPage from "./questionnaireDetailsPage";

vi.mock("../../client/questionnaires", () => ({
  getQuestionnaire: vi.fn(),
  getQuestionnaireModes: vi.fn(),
  getSurveyDays: vi.fn(),
}));

vi.mock("../../client/tmReleaseDate", () => ({
  getTmReleaseDate: vi.fn(),
}));

vi.mock("../../client/logger", () => ({
  clientLogger: {
    info: vi.fn(),
    error: vi.fn(),
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
  name: "LMS2101_AA1",
  dataRecordCount: 1,
  installDate: "2024-01-01T00:00:00.000Z",
  serverParkName: "gusty",
};

describe("QuestionnaireDetailsPage Totalmobile details", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders LMS questionnaire details when the Totalmobile release date is invalid", async () => {
    vi.mocked(getQuestionnaire).mockResolvedValue(questionnaireFixture);
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
