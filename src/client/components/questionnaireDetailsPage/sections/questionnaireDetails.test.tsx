import { cleanup, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { act } from "react";

import { opnQuestionnaire } from "../../../features/step_definitions/helpers/api.mock";
import flushPromises from "../../../test-utils/flushPromises";

import { QuestionnaireDetails } from "./questionnaireDetails";

const mock = new MockAdapter(axios);

describe("Questionnaire details happy path", () => {
  beforeEach(() => {
    render(
      <QuestionnaireDetails
        questionnaire={opnQuestionnaire}
        modes={["CATI"]}
      />,
    );
  });

  afterEach(() => {
    mock.reset();
  });

  it("should display 'Questionnaire details' as a header", async () => {
    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText("Questionnaire details")).toBeDefined();
    });
  });

  it("should display the questionnaire's 'Questionnaire status'", async () => {
    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText("Questionnaire status")).toBeDefined();
      expect(screen.getByText("Active")).toBeDefined();
    });
  });

  it("should display the questionnaire's 'Modes'", async () => {
    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText("Modes")).toBeDefined();
      expect(screen.getByText("CATI")).toBeDefined();
    });
  });

  it("should display the questionnaire's 'Number of cases'", async () => {
    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText("Number of cases")).toBeDefined();
      expect(screen.getByText("0")).toBeDefined();
    });
  });

  it("should display the questionnaire's 'Install date'", async () => {
    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText("Install date")).toBeDefined();
      expect(screen.getByText("15/01/2021 15:26")).toBeDefined();
    });
  });

  it("should display the questionnaire's 'Blaise version'", async () => {
    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText("Blaise version")).toBeDefined();
      expect(screen.getByText("5.9.9.2735")).toBeDefined();
    });
  });

  it("should render an empty questionnaire status when the status is missing", async () => {
    cleanup();

    render(
      <QuestionnaireDetails
        questionnaire={{ ...opnQuestionnaire, status: undefined }}
        modes={["CATI"]}
      />,
    );

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText("Questionnaire status")).toBeDefined();
      expect(screen.queryByText("undefined")).not.toBeInTheDocument();
    });
  });
});
