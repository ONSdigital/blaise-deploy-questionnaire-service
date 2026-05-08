/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";

import {
  ipsPilotQuestionnaire,
  ipsQuestionnaire,
} from "../../../features/step_definitions/helpers/apiMockObjects";
import flushPromises from "../../../tests/utils";

import CreateDonorCases from "./createDonorCases";

const mock = new MockAdapter(axios);

// mock login
vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } =
    await import("blaise-login-react/blaise-login-react-client");

  return mockLoginReactClientModule();
});
const { MockAuthenticate } = await import("blaise-login-react/blaise-login-react-client");

MockAuthenticate.OverrideReturnValues(null, true);

describe("IPS questionnaires", () => {
  afterEach(() => {
    mock.reset();
  });

  it("should display the option to create donor cases for IPS Manager and IPS Field Interviewer", async () => {
    render(
      <MemoryRouter initialEntries={["/questionnaire/"]}>
        <CreateDonorCases questionnaire={ipsQuestionnaire} />
      </MemoryRouter>,
    );

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText("IPS Manager")).toBeDefined();
      expect(screen.getByText("IPS Field Interviewer")).toBeDefined();
      const createCasesElements = screen.getAllByText("Create cases");

      expect(createCasesElements.length).toBe(4);
    });
  });

  it("should display the option to create donor cases for IPS Pilot Interviewer only given it's an IPS Pilot Questionnaire", async () => {
    render(
      <MemoryRouter initialEntries={["/questionnaire/"]}>
        <CreateDonorCases questionnaire={ipsPilotQuestionnaire} />
      </MemoryRouter>,
    );

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText("IPS Pilot Interviewer")).toBeDefined();
      const createCasesElements = screen.getAllByText("Create cases");

      expect(createCasesElements.length).toBe(3);
    });
  });
});
