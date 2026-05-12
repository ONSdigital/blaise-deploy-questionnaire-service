import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";

import App from "./app";
import { questionnaireList } from "./features/step_definitions/helpers/api.mock";
import { MockAuthenticate } from "./test-utils/authenticate.mock";
import flushPromises from "./test-utils/flushPromises";
import { createWrapper } from "./test-utils/renderWithQueryClient";

const mock = new MockAdapter(axios);

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("./test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

const mockIsProduction = vi.fn();

vi.mock("./utils/env", () => ({
  isProduction: () => mockIsProduction(),
}));

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
