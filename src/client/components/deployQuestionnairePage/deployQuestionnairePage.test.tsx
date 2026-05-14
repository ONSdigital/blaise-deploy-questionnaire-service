import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { act } from "react";
import { BrowserRouter } from "react-router-dom";

import { questionnaireList } from "../../features/step_definitions/helpers/api.mock";
import {
  clickContinue,
  navigatePastSettingToStartDateAndDeployQuestionnaire,
  navigateToDeployPageAndSelectFile,
} from "../../features/step_definitions/helpers/functions";
import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import flushPromises from "../../test-utils/flushPromises";
import { createWrapper } from "../../test-utils/renderWithQueryClient";

import DeployPage from "./deployQuestionnairePage";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Upload Page", () => {
  beforeEach(() => {
    mock.onGet("/api/questionnaires").reply(200, questionnaireList);
  });

  afterEach(() => {
    mock.reset();
  });

  it("select file page matches Snapshot", async () => {
    const wrapper = render(<DeployPage />, { wrapper: createWrapper(BrowserRouter) });

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });

  it("should render correctly", async () => {
    const { getByText, queryByText } = render(<DeployPage />, {
      wrapper: createWrapper(BrowserRouter),
    });

    await waitFor(() => {
      expect(getByText(/Deploy questionnaire/i)).toBeDefined();
      expect(getByText(/Select questionnaire package/i)).toBeDefined();
      expect(queryByText(/Table of questionnaires/i)).not.toBeInTheDocument();
    });
  });

  it("should disable continue until a file is selected", async () => {
    render(<DeployPage />, { wrapper: createWrapper(BrowserRouter) });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Continue/i })).toBeDisabled();
    });
  });

  it("should keep continue disabled for non-.bpkg files", async () => {
    render(<DeployPage />, { wrapper: createWrapper(BrowserRouter) });

    const input = screen.getByLabelText(/Select questionnaire package/i);

    const file = new File(["(⌐□_□)"], "OPN2004A.pdf", { type: "application/pdf" });

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Continue/i })).toBeDisabled();
    });
  });

  it("should enable continue once a .bpkg file is selected", async () => {
    render(<DeployPage />, { wrapper: createWrapper(BrowserRouter) });

    const input = screen.getByLabelText(/Select questionnaire package/i);
    const file = new File(["test"], "OPN2004A.bpkg", { type: "application/octet-stream" });

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Continue/i })).toBeEnabled();
    });
  });

  it("should disable continue on Telephone Operations start date step until an option is selected", async () => {
    mock.onGet("/api/questionnaires/OPN2004A").reply(404);

    render(<DeployPage />, { wrapper: createWrapper(BrowserRouter) });

    const input = screen.getByLabelText(/Select questionnaire package/i);
    const file = new File(["test"], "OPN2004A.bpkg", { type: "application/octet-stream" });

    await userEvent.upload(input, file);
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Would you like to set a Telephone Operations start date/i),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Continue/i })).toBeDisabled();
    });

    await userEvent.click(screen.getByLabelText(/No start date/i));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Continue/i })).toBeEnabled();
    });
  });

  it("should disable continue on Totalmobile release date step until an option is selected", async () => {
    mock.onGet("/api/questionnaires/LMS2207T").reply(404);

    render(<DeployPage />, { wrapper: createWrapper(BrowserRouter) });

    const input = screen.getByLabelText(/Select questionnaire package/i);
    const file = new File(["test"], "LMS2207T.bpkg", { type: "application/octet-stream" });

    await userEvent.upload(input, file);
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Would you like to set a Telephone Operations start date/i),
      ).toBeInTheDocument();
    });

    await userEvent.click(screen.getByLabelText(/No start date/i));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Would you like to set a Totalmobile release date/i),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Continue/i })).toBeDisabled();
    });

    await userEvent.click(screen.getByLabelText(/No release date/i));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Continue/i })).toBeEnabled();
    });
  });

  it("should ask both date questions for DST questionnaires", async () => {
    mock.onGet("/api/questionnaires/DST2207T").reply(404);

    render(<DeployPage />, { wrapper: createWrapper(BrowserRouter) });

    const input = screen.getByLabelText(/Select questionnaire package/i);
    const file = new File(["test"], "DST2207T.bpkg", { type: "application/octet-stream" });

    await userEvent.upload(input, file);
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Would you like to set a Telephone Operations start date/i),
      ).toBeInTheDocument();
    });

    await userEvent.click(screen.getByLabelText(/No start date/i));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Would you like to set a Totalmobile release date/i),
      ).toBeInTheDocument();
    });
  });

  it("should ask only Telephone Operations start date for OPN questionnaires", async () => {
    mock.onGet("/api/questionnaires/OPN2207T").reply(404);

    render(<DeployPage />, { wrapper: createWrapper(BrowserRouter) });

    const input = screen.getByLabelText(/Select questionnaire package/i);
    const file = new File(["test"], "OPN2207T.bpkg", { type: "application/octet-stream" });

    await userEvent.upload(input, file);
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Would you like to set a Telephone Operations start date/i),
      ).toBeInTheDocument();
    });

    await userEvent.click(screen.getByLabelText(/No start date/i));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Deployment summary/i)).toBeInTheDocument();
      expect(
        screen.queryByText(/Would you like to set a Totalmobile release date/i),
      ).not.toBeInTheDocument();
    });
  });
});

describe("Given the file fails to upload", () => {
  beforeEach(() => {
    mock.onPut("https://storage.googleapis.com/upload").reply(500, {});
    mock
      .onGet("/upload/init?filename=OPN2004A.bpkg")
      .reply(200, "https://storage.googleapis.com/upload");
    mock.onGet("/upload/verify?filename=OPN2004A.bpkg").reply(200, { name: "OPN2004A.bpkg" });
    mock.onGet("/api/questionnaires").reply(200, questionnaireList);
    mock.onGet("/api/questionnaires/OPN2004A").reply(404);
    mock.onPost("/api/tostartdate/OPN2004A").reply(201);
  });

  afterEach(() => {
    mock.reset();
  });

  it("it should redirect to the summary page with an error", async () => {
    await navigateToDeployPageAndSelectFile();
    await clickContinue();

    await navigatePastSettingToStartDateAndDeployQuestionnaire();

    await waitFor(() => {
      expect(
        screen.getAllByText((_, element) => {
          const text = (element?.textContent ?? "").replace(/\s+/g, " ").toLowerCase();

          return text.includes("deploy failed");
        }).length,
      ).toBeGreaterThan(0);
      expect(screen.getByText(/Reason: Failed to upload questionnaire/i)).toBeDefined();
    });
  });
});
