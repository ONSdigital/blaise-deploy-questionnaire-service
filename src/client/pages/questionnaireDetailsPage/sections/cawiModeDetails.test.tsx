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

const createObjectUrlMock = vi.fn(() => "blob:generated-uacs");
const revokeObjectUrlMock = vi.fn();

vi.mock("../../../api/processes", () => ({
  generateUacsAndCsvFileData: generateUacsAndCsvFileDataMock,
}));

vi.mock("../../../utils/logger", () => ({
  clientLogger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("CAWI mode details", () => {
  beforeEach(() => {
    vi.spyOn(URL, "createObjectURL").mockImplementation(createObjectUrlMock);
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(revokeObjectUrlMock);
  });

  afterEach(() => {
    mock.reset();
    createObjectUrlMock.mockClear();
    revokeObjectUrlMock.mockClear();
    vi.restoreAllMocks();
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
    const viewGeneratedUacsFailedMessage = /Failed to get CAWI mode details/i;

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

  it("should display a service error when the UAC count lookup fails", async () => {
    mock.onGet("/api/uacs/instrument/OPN2004A/count").reply(500);
    mock.onGet("/api/questionnaires/OPN2004A/modes").reply(200, ["CAWI"]);

    render(
      <CawiModeDetails
        questionnaire={opnQuestionnaire}
        modes={["CAWI"]}
      />,
      { wrapper: createWrapper() },
    );

    expect(
      await screen.findByText(/Failed to get Unique Access Code details/i),
    ).toBeInTheDocument();
  });

  it("should not render the generate button when there are no records and no generated UACs", async () => {
    mock.onGet("/api/uacs/instrument/OPN2004A/count").reply(200, { count: 0 });
    mock.onGet("/api/questionnaires/OPN2004A/modes").reply(200, ["CAWI"]);

    render(
      <CawiModeDetails
        questionnaire={{ ...opnQuestionnaire, dataRecordCount: 0 }}
        modes={["CAWI"]}
      />,
      { wrapper: createWrapper() },
    );

    expect(await screen.findByText("CAWI mode details")).toBeInTheDocument();
    expect(screen.queryByText(/Generate and download Unique Access Codes/i)).toBeNull();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("should treat a missing record count as zero when deciding whether to show the generate button", async () => {
    mock.onGet("/api/uacs/instrument/OPN2004A/count").reply(200, { count: 0 });
    mock.onGet("/api/questionnaires/OPN2004A/modes").reply(200, ["CAWI"]);

    const questionnaireWithoutRecordCount = { ...opnQuestionnaire };

    Reflect.deleteProperty(questionnaireWithoutRecordCount, "dataRecordCount");

    render(
      <CawiModeDetails
        questionnaire={questionnaireWithoutRecordCount}
        modes={["CAWI"]}
      />,
      { wrapper: createWrapper() },
    );

    expect(await screen.findByText("CAWI mode details")).toBeInTheDocument();
    expect(screen.queryByText(/Generate and download Unique Access Codes/i)).toBeNull();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("should not render when fetched questionnaire modes do not include CAWI", async () => {
    mock.onGet("/api/uacs/instrument/OPN2004A/count").reply(200, { count: 1 });
    mock.onGet("/api/questionnaires/OPN2004A/modes").reply(200, ["CATI"]);

    const { container } = render(
      <CawiModeDetails
        questionnaire={opnQuestionnaire}
        modes={["CAWI"]}
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });

  it("should show a loading count while the UAC count request is pending", async () => {
    mock.onGet("/api/questionnaires/OPN2004A/modes").reply(200, ["CAWI"]);
    mock.onGet("/api/uacs/instrument/OPN2004A/count").reply(() => new Promise(() => {}));

    render(
      <CawiModeDetails
        questionnaire={{ ...opnQuestionnaire, dataRecordCount: 1 }}
        modes={["CAWI"]}
      />,
      { wrapper: createWrapper() },
    );

    expect(await screen.findByText("Loading...")).toBeInTheDocument();
  });

  it("should generate Uacs successfully", async () => {
    mock.onGet("/api/uacs/instrument/OPN2004A/count").reply(200, { count: 1 });
    mock.onGet("/api/questionnaires/OPN2004A/modes").reply(200, ["CAWI"]);

    const questionnaireWithDataRecords = {
      ...opnQuestionnaire,
      dataRecordCount: 1,
    };

    const { container } = render(
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
    const hiddenDownloadLink = container.querySelector('a[aria-hidden="true"]');

    expect(hiddenDownloadLink).not.toBeNull();

    const clickSpy = vi.spyOn(hiddenDownloadLink as HTMLAnchorElement, "click");

    await userEvent.click(generateUacsButton);

    await waitFor(() => {
      expect(generateUacsAndCsvFileDataMock).toHaveBeenCalledWith("OPN2004A");
      expect(createObjectUrlMock).toHaveBeenCalledTimes(1);
      expect(revokeObjectUrlMock).toHaveBeenCalledWith("blob:generated-uacs");
      expect(hiddenDownloadLink).toHaveAttribute("href", "blob:generated-uacs");
      expect(hiddenDownloadLink).toHaveAttribute("download", "OPN2004A-uac.csv");
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("should show a generation error when creating UACs fails", async () => {
    generateUacsAndCsvFileDataMock.mockRejectedValueOnce(new Error("boom"));
    mock.onGet("/api/uacs/instrument/OPN2004A/count").reply(200, { count: 1 });
    mock.onGet("/api/questionnaires/OPN2004A/modes").reply(200, ["CAWI"]);

    render(
      <CawiModeDetails
        questionnaire={{ ...opnQuestionnaire, dataRecordCount: 1 }}
        modes={["CAWI"]}
      />,
      { wrapper: createWrapper() },
    );

    await userEvent.click(await screen.findByText(/Generate and download Unique Access Codes/i));

    expect(
      await screen.findByText(/Error occurred while generating Unique Access Codes/i),
    ).toBeInTheDocument();
  });
});
