import "@testing-library/jest-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { act } from "react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";

import App from "./app";
import { questionnaireList } from "./features/step_definitions/helpers/api.mock";
import { MockAuthenticate } from "./test-utils/authenticate.mock";
import flushPromises from "./test-utils/flushPromises";
import { createTestQueryClient, createWrapper } from "./test-utils/renderWithQueryClient";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("./test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

const mockIsProduction = vi.fn();

vi.mock("./utils/env", () => ({
  isProduction: () => mockIsProduction(),
}));

vi.mock("./components/createDonorCasesPage/createDonorCasesPage", () => ({
  default: () => <div>Create donor cases page</div>,
}));

vi.mock("./components/auditPage/auditPage", () => ({
  default: () => <div>Audit page</div>,
}));

vi.mock("./components/reinstallQuestionnairesPage/reinstallQuestionnairesPage", () => ({
  default: () => <div>Reinstall questionnaires page</div>,
}));

vi.mock("./components/reissueNewDonorCasePage/reissueNewDonorCasePage", () => ({
  default: () => <div>Reissue new donor case page</div>,
}));

vi.mock("./components/deleteQuestionnairePage/deleteQuestionnairePage", () => ({
  default: ({
    onCancel,
    onDelete,
  }: {
    onCancel: (questionnaireName: string) => void;
    onDelete: (questionnaireName: string) => void;
  }) => {
    return (
      <>
        <button
          type="button"
          onClick={() => onDelete("OPN2007T")}
        >
          Delete questionnaire
        </button>
        <button
          type="button"
          onClick={() => onCancel("OPN2007T")}
        >
          Cancel deletion
        </button>
      </>
    );
  },
}));

function renderAtRoute(initialEntry: string) {
  const client = createTestQueryClient();

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("DQS homepage", () => {
  beforeAll(() => {
    mock.onGet("/api/questionnaires").reply(200, questionnaireList);
  });

  afterAll(() => {
    mock.reset();
  });

  beforeEach(() => {
    mockIsProduction.mockReturnValue(false);
    MockAuthenticate.OverrideReturnValues(null, true);
  });

  it("should not show 'not a production environment banner' when in production", async () => {
    mockIsProduction.mockReturnValue(true);
    render(<App />, { wrapper: createWrapper(BrowserRouter) });

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(/Deploy Questionnaire Service/i)).toBeInTheDocument();
    });

    expect(
      screen.queryByText(
        /This is not a production environment. Do not upload any production data to this service./i,
      ),
    ).not.toBeInTheDocument();
  });

  it("should show 'not a production environment banner' when not in production", async () => {
    render(<App />, { wrapper: createWrapper(BrowserRouter) });

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          /This is not a production environment. Do not upload any production data to this service./i,
        ),
      ).toBeDefined();
    });
  });

  it("should render the login page when a user is not signed in", async () => {
    MockAuthenticate.OverrideReturnValues(null, false);

    const { getByText } = render(<App />, { wrapper: createWrapper(BrowserRouter) });

    await waitFor(() => {
      expect(getByText(/Enter your Blaise username and password/i)).toBeInTheDocument();
    });
  });

  it("should render the homepage when a user is signed in", async () => {
    const { getByText, queryByText } = render(<App />, { wrapper: createWrapper(BrowserRouter) });

    expect(queryByText(/Loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText(/Deploy Questionnaire Service/i)).toBeInTheDocument();
      expect(getByText(/OPN2007T/i)).toBeInTheDocument();
      expect(queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });
});

describe("Given the API returns malformed json", () => {
  beforeAll(() => {
    mock.onGet("/api/questionnaires").reply(500, { text: "Hello" });
  });

  it("it should render with the error message displayed", async () => {
    const { getByText, queryByText } = render(<App />, { wrapper: createWrapper(BrowserRouter) });

    expect(queryByText(/Loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(
        getByText(
          /Sorry, there is a problem with this service. We are working to fix the problem. Please try again later./i,
        ),
      ).toBeDefined();
      expect(queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  afterAll(() => {
    mock.reset();
  });
});

describe("Given the API returns an empty list", () => {
  beforeAll(() => {
    mock.onGet("/api/questionnaires").reply(200, []);
  });

  afterAll(() => {
    mock.reset();
  });

  it("it should render with a message to inform the user in the list", async () => {
    const { getByText, queryByText } = render(<App />, { wrapper: createWrapper(BrowserRouter) });

    expect(queryByText(/Loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText(/No installed questionnaires found./i)).toBeDefined();
      expect(queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });
});

describe("App routes and status lifecycle", () => {
  beforeEach(() => {
    mock.onGet("/api/questionnaires").reply(200, questionnaireList);
    mockIsProduction.mockReturnValue(true);
    MockAuthenticate.OverrideReturnValues(null, true);
  });

  afterEach(() => {
    mock.reset();
    vi.useRealTimers();
  });

  it("loads the create donor cases page on its direct route", async () => {
    renderAtRoute("/questionnaire/OPN2007T/create-donor-cases/IPS%20Manager");

    await waitFor(() => {
      expect(screen.getByText("Create donor cases page")).toBeInTheDocument();
    });
  });

  it("loads the audit page on its direct route", async () => {
    renderAtRoute("/audit");

    await waitFor(() => {
      expect(screen.getByText("Audit page")).toBeInTheDocument();
    });
  });

  it("loads the reinstall questionnaires page on its direct route", async () => {
    renderAtRoute("/reinstall");

    await waitFor(() => {
      expect(screen.getByText("Reinstall questionnaires page")).toBeInTheDocument();
    });
  });

  it("loads the reissue new donor case page on its direct route", async () => {
    renderAtRoute("/questionnaire/OPN2007T/reissue-new-donor-case/test%20user");

    await waitFor(() => {
      expect(screen.getByText("Reissue new donor case page")).toBeInTheDocument();
    });
  });

  it("shows a persistent delete success summary after returning home", async () => {
    renderAtRoute("/questionnaire/OPN2007T/delete");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Delete questionnaire" })).toBeInTheDocument();
    });

    vi.useFakeTimers();

    fireEvent.click(screen.getByRole("button", { name: "Delete questionnaire" }));

    expect(
      screen.getByRole("heading", { name: /Questionnaire OPN2007T deleted successfully/i }),
    ).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(
      screen.getByRole("heading", { name: /Questionnaire OPN2007T deleted successfully/i }),
    ).toBeInTheDocument();
  });
});
