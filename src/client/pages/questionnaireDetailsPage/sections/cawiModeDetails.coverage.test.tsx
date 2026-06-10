import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { opnQuestionnaire } from "../../../features/step_definitions/helpers/api.mock";
import { createWrapper } from "../../../test-utils/renderWithQueryClient";

import { CawiModeDetails } from "./cawiModeDetails";

const { generateUacsAndCsvFileDataMock, getQuestionnaireModesMock, getUacCountMock } = vi.hoisted(
  () => ({
    generateUacsAndCsvFileDataMock: vi.fn(),
    getQuestionnaireModesMock: vi.fn(),
    getUacCountMock: vi.fn(),
  }),
);

vi.mock("../../../api/processes", () => ({
  generateUacsAndCsvFileData: generateUacsAndCsvFileDataMock,
}));

vi.mock("../../../api/questionnaires", () => ({
  getQuestionnaireModes: getQuestionnaireModesMock,
}));

vi.mock("../../../api/uacs", () => ({
  getUacCount: getUacCountMock,
}));

vi.mock("../../../utils/logger", () => ({
  clientLogger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("blaise-design-system-react-components", () => ({
  Button: ({ label, onClick }: { label: string; onClick?: () => void }) => (
    <button onClick={onClick}>{label}</button>
  ),
  GroupedSummary: class GroupedSummary {
    constructor(public groups: Array<{ records: Record<string, { display: React.ReactNode }> }>) {}
  },
  LoadingPanel: ({ message }: { message?: string }) => <div>{message ?? "Loading"}</div>,
  Panel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SummaryGroupTable: ({
    groupedSummary,
  }: {
    groupedSummary: {
      groups: Array<{
        title?: string;
        preamble?: React.ReactNode;
        records: Record<string, { display: React.ReactNode }>;
      }>;
    };
  }) => (
    <div>
      {groupedSummary.groups.map((group) => (
        <section key={group.title ?? Object.keys(group.records).join("|")}>
          {group.title ? <h2>{group.title}</h2> : null}
          {group.preamble}
          {Object.entries(group.records).map(([label, record]) => (
            <div key={label}>
              <span>{label}</span>
              {record.display}
            </div>
          ))}
        </section>
      ))}
    </div>
  ),
}));

describe("CawiModeDetails CSV coverage", () => {
  async function readBlobAsText(blob: Blob): Promise<string> {
    if (typeof blob.text === "function") {
      return blob.text();
    }

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(String(reader.result ?? ""));
      };

      reader.onerror = () => {
        reject(reader.error ?? new Error("Failed to read blob contents"));
      };

      reader.readAsText(blob);
    });
  }

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("serializes generated UAC rows into a CSV blob before downloading", async () => {
    getQuestionnaireModesMock.mockResolvedValue(["CAWI"]);
    getUacCountMock.mockResolvedValue(1);
    generateUacsAndCsvFileDataMock.mockResolvedValue([{ caseId: "1", uac: 'A"B', note: null }]);

    let capturedBlob: Blob | undefined;

    vi.spyOn(URL, "createObjectURL").mockImplementation((blob: Blob | MediaSource) => {
      capturedBlob ??= blob as Blob;

      return "blob:generated-uacs";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);

    const { container } = render(
      <CawiModeDetails
        questionnaire={{ ...opnQuestionnaire, dataRecordCount: 1 }}
        modes={["CAWI"]}
      />,
      { wrapper: createWrapper() },
    );

    const button = await screen.findByRole("button", {
      name: /Generate and download Unique Access Codes/i,
    });
    const hiddenDownloadLink = container.querySelector('a[aria-hidden="true"]');

    expect(hiddenDownloadLink).not.toBeNull();

    const clickSpy = vi.spyOn(hiddenDownloadLink as HTMLAnchorElement, "click");

    await userEvent.click(button);

    await waitFor(() => {
      expect(generateUacsAndCsvFileDataMock).toHaveBeenCalledWith("OPN2004A");
      expect(capturedBlob).toBeDefined();
      expect(hiddenDownloadLink).toHaveAttribute("href", "blob:generated-uacs");
      expect(hiddenDownloadLink).toHaveAttribute("download", "OPN2004A-uac.csv");
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    const csvText = await readBlobAsText(capturedBlob as Blob);

    expect(csvText.replace(/^\uFEFF/, "")).toBe('caseId,uac,note\r\n"1","A""B",""');
  });
});
