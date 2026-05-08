/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { type ReactNode } from "react";
import { act } from "react-dom/test-utils";

import { opnQuestionnaire } from "../../../features/step_definitions/helpers/apiMockObjects";
import flushPromises from "../../../tests/utils";

import CawiModeDetails from "./cawiModeDetails";

vi.mock("../../../client/componentProcesses", () => ({
  generateUACCodesAndCSVFileData: vi.fn().mockResolvedValue([{ caseId: "1", uac: "2" }]),
}));

vi.mock("../../../client/logger", () => ({
  clientLogger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Make CsvDownloader clickable in tests and call datas() when clicked.
vi.mock("react-csv-downloader", () => {
  function CsvDownloaderMock({
    datas,
    children,
  }: {
    datas: () => Promise<unknown>;
    children: ReactNode;
  }) {
    return (
      <div
        data-testid="csv-downloader"
        onClick={() => datas()}
      >
        {children}
      </div>
    );
  }

  return CsvDownloaderMock;
});

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
    );

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });

  it("should display an error message when it fails to load the generated UACs", async () => {
    const viewGeneratedUacsFailedMessage = /Failed to get Web mode details/i;

    mock.onGet("/api/uacs/instrument/OPN2004A/count").reply(500);
    render(
      <CawiModeDetails
        questionnaire={opnQuestionnaire}
        modes={["CAWI"]}
      />,
    );

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(viewGeneratedUacsFailedMessage)).toBeDefined();
    });
  });

  it("should generate UAC codes successfully", async () => {
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
    );

    await act(async () => {
      await flushPromises();
    });

    // Clicking the downloader wrapper triggers datas() in our mock.
    const downloader = await screen.findByTestId("csv-downloader");

    downloader.click();
    await waitFor(() => {
      expect(screen.getByText("Generating Unique Access Codes for cases")).toBeDefined();
    });
  });
});
