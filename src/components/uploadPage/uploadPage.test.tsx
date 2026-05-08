/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";

import { questionnaireList } from "../../features/step_definitions/helpers/apiMockObjects";
import {
  clickContinue,
  navigatePastSettingTOStartDateAndDeployQuestionnaire,
  navigateToDeployPageAndSelectFile,
} from "../../features/step_definitions/helpers/functions";
import flushPromises from "../../tests/utils";

import UploadPage from "./uploadPage";

// mock login
vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } =
    await import("blaise-login-react/blaise-login-react-client");

  return mockLoginReactClientModule();
});
const { MockAuthenticate } = await import("blaise-login-react/blaise-login-react-client");

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
    const wrapper = render(<UploadPage />, { wrapper: BrowserRouter });

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });

  it("should render correctly", async () => {
    const { getByText, queryByText } = render(<UploadPage />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(getByText(/Deploy a questionnaire file/i)).toBeDefined();
      expect(getByText(/Select survey package/i)).toBeDefined();
      expect(queryByText(/Table of questionnaires/i)).not.toBeInTheDocument();
    });
  });

  it("should disable continue until a file is selected", async () => {
    render(<UploadPage />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Continue/i })).toBeDisabled();
    });
  });

  it("should keep continue disabled for non-.bpkg files", async () => {
    render(<UploadPage />, { wrapper: BrowserRouter });

    const input = screen.getByLabelText(/Select survey package/i);

    const file = new File(["(⌐□_□)"], "OPN2004A.pdf", { type: "application/pdf" });

    userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.queryAllByText("File must be a .bpkg")).toHaveLength(2);
      expect(screen.getByRole("button", { name: /Continue/i })).toBeDisabled();
    });
  });

  it("should enable continue once a .bpkg file is selected", async () => {
    render(<UploadPage />, { wrapper: BrowserRouter });

    const input = screen.getByLabelText(/Select survey package/i);
    const file = new File(["test"], "OPN2004A.bpkg", { type: "application/octet-stream" });

    userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Continue/i })).toBeEnabled();
    });
  });

  it("should disable continue on TO start date step until an option is selected", async () => {
    mock.onGet("/api/questionnaires/OPN2004A").reply(404);

    render(<UploadPage />, { wrapper: BrowserRouter });

    const input = screen.getByLabelText(/Select survey package/i);
    const file = new File(["test"], "OPN2004A.bpkg", { type: "application/octet-stream" });

    userEvent.upload(input, file);
    userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Would you like to set a telephone operations start date/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Continue/i })).toBeDisabled();
    });

    userEvent.click(screen.getByText(/No start date/i));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Continue/i })).toBeEnabled();
    });
  });

  it("should disable continue on Totalmobile release date step until an option is selected", async () => {
    mock.onGet("/api/questionnaires/LMS2207T").reply(404);

    render(<UploadPage />, { wrapper: BrowserRouter });

    const input = screen.getByLabelText(/Select survey package/i);
    const file = new File(["test"], "LMS2207T.bpkg", { type: "application/octet-stream" });

    userEvent.upload(input, file);
    userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Would you like to set a telephone operations start date/i)).toBeInTheDocument();
    });

    userEvent.click(screen.getByText(/No start date/i));
    userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Would you like to set a Totalmobile release date/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Continue/i })).toBeDisabled();
    });

    userEvent.click(screen.getByText(/No release date/i));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Continue/i })).toBeEnabled();
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

    await navigatePastSettingTOStartDateAndDeployQuestionnaire();

    await waitFor(() => {
      expect(screen.getByText("File deploy failed")).toBeDefined();
      expect(screen.getByText(/Failed to upload questionnaire/i)).toBeDefined();
    });
  });
});
