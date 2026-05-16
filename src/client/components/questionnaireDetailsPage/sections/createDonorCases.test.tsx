import { render, screen } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { MemoryRouter } from "react-router-dom";

import {
  ipsPilotQuestionnaire,
  ipsQuestionnaire,
} from "../../../features/step_definitions/helpers/api.mock";
import { MockAuthenticate } from "../../../test-utils/authenticate.mock";

import { CreateDonorCases } from "./createDonorCases";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

describe("IPS questionnaires", () => {
  afterEach(() => {
    mock.reset();
  });

  it("should display the option to create donor cases for IPS Manager and IPS Field Interviewer", () => {
    render(
      <MemoryRouter initialEntries={["/questionnaire/"]}>
        <CreateDonorCases questionnaire={ipsQuestionnaire} />
      </MemoryRouter>,
    );

    expect(screen.getByText("IPS Manager")).toBeInTheDocument();
    expect(screen.getByText("IPS Field Interviewer")).toBeInTheDocument();
    expect(
      screen.getByText(/Only interviewers without an existing donor case will receive one\./),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Create cases")).toHaveLength(4);
  });

  it("should display the option to create donor cases for IPS Pilot Interviewer only given it's an IPS Pilot Questionnaire", () => {
    render(
      <MemoryRouter initialEntries={["/questionnaire/"]}>
        <CreateDonorCases questionnaire={ipsPilotQuestionnaire} />
      </MemoryRouter>,
    );

    expect(screen.getByText("IPS Pilot Interviewer")).toBeInTheDocument();
    expect(screen.getAllByText("Create cases")).toHaveLength(3);
  });
});
