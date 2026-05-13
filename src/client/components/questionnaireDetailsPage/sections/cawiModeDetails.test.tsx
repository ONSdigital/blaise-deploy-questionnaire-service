import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { act } from "react";

import { opnQuestionnaire } from "../../../features/step_definitions/helpers/api.mock";
import flushPromises from "../../../test-utils/flushPromises";
import { createWrapper } from "../../../test-utils/renderWithQueryClient";

import { CawiModeDetails } from "./cawiModeDetails";

const { generateUacsAndCsvFileDataMock } = vi.hoisted(() => ({
  generateUacsAndCsvFileDataMock: vi.fn().mockResolvedValue([{ caseId: "1", uac: "2" }]),
}));

vi.mock("../../../api/processes", () => ({
  generateUacsAndCsvFileData: generateUacsAndCsvFileDataMock,
}));

vi.mock("../../../api/logger", () => ({
  clientLogger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

const mock = new MockAdapter(axios);

describe("CAWI mode details", () => {
  afterEach(() => {
    mock.reset();
  });

  it("should not render for non-CAWI questionnaires", async () => {
    const { container } = render(
      <CawiModeDetails
        questionnaire={opnQuestionnaire}
        modes={["CATI"]}
      />,
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });

  it("should display an error message when it fails to load the generated Uacs", async () => {
    const viewGeneratedUacsFailedMessage = /Failed to get Web mode details/i;

    mock.onGet("/api/uacs/instrument/OPN2004A/count").reply(500);
    render(
      <CawiModeDetails
        questionnaire={opnQuestionnaire}
        modes={["CAWI"]}
      />,
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(viewGeneratedUacsFailedMessage)).toBeDefined();
    });
  });

  it("should generate Uacs successfully", async () => {
    mock.onGet("/api/uacs/instrument/OPN2004A/count").reply(200, { count: 1 });
    mock.onGet("/api/questionnaires/OPN2004A/modes").reply(200, ["CAWI"]);

    const questionnaireWithDataRecords = {
      ...opnQuestionnaire,
      dataRecordCount: 1,
    };

    render(
      <CawiModeDetails
        questionnaire={questionnaireWithDataRecords}
        modes={["CAWI"]}
      />,
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await flushPromises();
    });

    const generateUacsButton = await screen.findByText(
      /Generate and download Unique Access Codes/i,
    );

    await userEvent.click(generateUacsButton);
    await waitFor(() => {
      expect(generateUacsAndCsvFileDataMock).toHaveBeenCalledWith("OPN2004A");
    });
  });
});
