import "@testing-library/jest-dom/vitest";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { MemoryRouter } from "react-router-dom";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import flushPromises from "../../test-utils/flushPromises";
import { createTestQueryClient } from "../../test-utils/renderWithQueryClient";

import QuestionnairesPage from "./questionnairesPage";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

function renderWithRouter(component: React.ReactElement) {
  const client = createTestQueryClient();

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/questionnaire/"]}>{component}</MemoryRouter>
    </QueryClientProvider>,
  );
}

const MOCK_QUESTIONNAIRE_LIST = [
  {
    name: "IPS2409A",
    id: "ef8980d9-5f5c-416d-9b4b-9570c15c85c0",
    serverParkName: "gusty",
    installDate: "2024-10-16T13:14:01.7557563+01:00",
    status: "Active",
    dataRecordCount: 1,
    hasData: true,
    blaiseVersion: "5.14.4.3668",
    nodes: [
      {
        nodeName: "blaise-gusty-mgmt",
        nodeStatus: "Active",
      },
    ],
    fieldPeriod: "September 2024",
  },
  {
    name: "IPS2409B",
    id: "ef8980d9-5f5c-416d-9b4b-9570c15c85c0",
    serverParkName: "gusty",
    installDate: "2024-10-16T13:14:01.7557563+01:00",
    status: "Active",
    dataRecordCount: 1,
    hasData: true,
    blaiseVersion: "5.14.4.3668",
    nodes: [
      {
        nodeName: "blaise-gusty-mgmt",
        nodeStatus: "Active",
      },
    ],
    fieldPeriod: "September 2024",
  },
  {
    name: "IPS_ContactInfo",
    id: "10effca3-caec-4fc0-a037-20a43cf050c2",
    serverParkName: "gusty",
    installDate: "2024-10-18T12:59:23.4164608+01:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
    blaiseVersion: "5.14.4.3668",
    nodes: [
      {
        nodeName: "blaise-gusty-mgmt",
        nodeStatus: "Active",
      },
    ],
    fieldPeriod: "Unknown",
  },
  {
    name: "IPS_Attempts",
    id: "10effca3-caec-4fc0-a037-20a43cf050c4",
    serverParkName: "gusty",
    installDate: "2024-10-18T12:59:23.4164608+01:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
    blaiseVersion: "5.14.4.3668",
    nodes: [
      {
        nodeName: "blaise-gusty-mgmt",
        nodeStatus: "Active",
      },
    ],
    fieldPeriod: "Unknown",
  },
  {
    name: "DST2304Z",
    id: "10effca3-caec-4fc0-a037-20a43cf050c5",
    serverParkName: "gusty",
    installDate: "2024-10-18T12:59:23.4164608+01:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
    blaiseVersion: "5.14.4.3668",
    nodes: [
      {
        nodeName: "blaise-gusty-mgmt",
        nodeStatus: "Active",
      },
    ],
    fieldPeriod: "Unknown",
  },
];

describe("Questionnaire List displays valid user questionnaires", () => {
  beforeEach(() => {
    mock.onGet("/api/questionnaires").reply(200, MOCK_QUESTIONNAIRE_LIST);
  });

  afterEach(() => {
    mock.reset();
  });

  it("should not display any questionnaires if no questionnaires were fetched back from the server", async () => {
    mock.onGet("/api/questionnaires").reply(200, []);
    renderWithRouter(<QuestionnairesPage setErrored={vi.fn()} />);

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(/Filter by questionnaire name/i)).toBeVisible();
      expect(screen.getByText(/No installed questionnaires found/i)).toBeVisible();
    });
  });

  it("should display a list of questionnaires containing only questionnaires that match the filter", async () => {
    renderWithRouter(<QuestionnairesPage setErrored={vi.fn()} />);

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(/IPS2409A/i)).toBeVisible();
    });

    const filterInput = screen.getByTestId(/filter-by-name-input/i);

    await userEvent.type(filterInput, "IPS2409A");

    await waitFor(() => {
      expect(screen.getByText(/Filter by questionnaire name/i)).toBeVisible();
      expect(screen.getByText(/1 results of 5/i)).toBeVisible();
      expect(screen.getByText(/IPS2409A/i)).toBeVisible();
    });
  });

  it("shows an info panel when the filter has no matches", async () => {
    renderWithRouter(<QuestionnairesPage setErrored={vi.fn()} />);

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(/IPS2409A/i)).toBeVisible();
    });

    const filterInput = screen.getByTestId(/filter-by-name-input/i);

    await userEvent.type(filterInput, "NO_MATCHES");

    await waitFor(() => {
      expect(screen.getByText(/No questionnaires containing NO_MATCHES found/i)).toBeVisible();
    });
  });

  it("shows an error panel when loading questionnaires fails", async () => {
    mock.reset();
    mock.onGet("/api/questionnaires").reply(500);
    const setErrored = vi.fn();

    const { container } = renderWithRouter(<QuestionnairesPage setErrored={setErrored} />);

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(/Unable to load questionnaires/i)).toBeVisible();
      expect(setErrored).toHaveBeenCalledWith(true);
      expect(container.querySelector(".ons-panel--error")).toBeTruthy();
    });
  });

  it("passes an empty status to the status component when a questionnaire status is missing", async () => {
    mock.onGet("/api/questionnaires").reply(200, [
      {
        ...MOCK_QUESTIONNAIRE_LIST[0],
        name: "IPS2410A",
        status: undefined,
      },
    ]);

    renderWithRouter(<QuestionnairesPage setErrored={vi.fn()} />);

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(/IPS2410A/i)).toBeVisible();
      expect(screen.queryByText("undefined")).not.toBeInTheDocument();
    });
  });
});

describe("Questionnaire List displays hidden questionnaires that match when using the search filter", () => {
  beforeEach(() => {
    mock.onGet("/api/questionnaires").reply(200, MOCK_QUESTIONNAIRE_LIST);
  });

  afterEach(() => {
    mock.reset();
  });

  it("should display the hidden ContactInfo questionnaire", async () => {
    renderWithRouter(<QuestionnairesPage setErrored={vi.fn()} />);

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(/IPS2409A/i)).toBeVisible();
    });

    const filterInput = screen.getByTestId(/filter-by-name-input/i);

    await userEvent.type(filterInput, "ContactInfo");

    await waitFor(() => {
      expect(screen.getByText(/Filter by questionnaire name/i)).toBeVisible();
      expect(screen.getByText(/1 results of 5/i)).toBeVisible();
      expect(screen.getByText(/IPS_ContactInfo/i)).toBeVisible();
    });
  });

  it("should display the hidden Attempts questionnaire", async () => {
    renderWithRouter(<QuestionnairesPage setErrored={vi.fn()} />);

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(/IPS2409A/i)).toBeVisible();
    });

    const filterInput = screen.getByTestId(/filter-by-name-input/i);

    await userEvent.type(filterInput, "Attempts");

    await waitFor(() => {
      expect(screen.getByText(/Filter by questionnaire name/i)).toBeVisible();
      expect(screen.getByText(/1 results of 5/i)).toBeVisible();
      expect(screen.getByText(/IPS_Attempts/i)).toBeVisible();
    });
  });

  it("should display the hidden DST2304Z test questionnaire", async () => {
    renderWithRouter(<QuestionnairesPage setErrored={vi.fn()} />);

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(/IPS2409A/i)).toBeVisible();
    });

    const filterInput = screen.getByTestId(/filter-by-name-input/i);

    await userEvent.type(filterInput, "DST2304Z");

    await waitFor(() => {
      expect(screen.getByText(/Filter by questionnaire name/i)).toBeVisible();
      expect(screen.getByText(/1 results of 5/i)).toBeVisible();
      expect(screen.getByText(/DST2304Z/i)).toBeVisible();
    });
  });
});
