import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { ReissueNewDonorCase } from "./reissueNewDonorCase";

import type { Questionnaire } from "blaise-api-node-client";

const mockNavigate = vi.fn();

const { mockFindUser } = vi.hoisted(() => ({
  mockFindUser: vi.fn(),
}));

vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useNavigate: () => mockNavigate,
}));

vi.mock("blaise-design-system-react-components", () => ({
  Button: ({ label, onClick }: { label: string; onClick?: () => void }) => (
    <button onClick={onClick}>{label}</button>
  ),
  GroupedSummary: class GroupedSummary {
    constructor(public groups: unknown[]) {}
  },
  Panel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SummaryGroupTable: ({
    groupedSummary,
  }: {
    groupedSummary: { groups: Array<{ title?: string; preamble: React.ReactNode }> };
  }) => (
    <div>
      {groupedSummary.groups.map((group) => (
        <div key={group.title ?? String(group.preamble)}>{group.preamble}</div>
      ))}
    </div>
  ),
}));

vi.mock("./findUser", () => ({
  FindUser: (props: unknown) => {
    mockFindUser(props);
    const { onError, onItemSelected } = props as {
      onError: (message: string) => void;
      onItemSelected: (user: string) => void;
    };

    return (
      <div>
        <button onClick={() => onItemSelected("  field.user  ")}>Select user</button>
        <button onClick={() => onItemSelected("   ")}>Select blank user</button>
        <button onClick={() => onError("User lookup failed")}>Trigger error</button>
      </div>
    );
  },
}));

describe("ReissueNewDonorCase", () => {
  const questionnaire = { name: "IPS2101A" } as Questionnaire;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("passes the expected roles to FindUser", () => {
    render(<ReissueNewDonorCase questionnaire={questionnaire} />);

    expect(mockFindUser).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "Enter username",
        roles: ["IPS Field Interviewer", "IPS Manager", "IPS Pilot Interviewer"],
      }),
    );
  });

  it("shows a lookup error reported by FindUser", () => {
    render(<ReissueNewDonorCase questionnaire={questionnaire} />);

    fireEvent.click(screen.getByRole("button", { name: /Trigger error/i }));

    expect(screen.getByText(/User lookup failed/i)).toBeInTheDocument();
  });

  it("trims the selected user and navigates to the reissue page", () => {
    render(<ReissueNewDonorCase questionnaire={questionnaire} />);

    fireEvent.click(screen.getByRole("button", { name: /Select user/i }));
    fireEvent.click(screen.getByRole("button", { name: /Reissue donor case/i }));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/questionnaire/IPS2101A/reissue-new-donor-case/field.user",
      {
        state: {
          section: "reissueNewDonorCase",
          questionnaire,
          user: "field.user",
        },
      },
    );
  });

  it("shows a validation message when the selected user is only whitespace", () => {
    render(<ReissueNewDonorCase questionnaire={questionnaire} />);

    fireEvent.click(screen.getByRole("button", { name: /Select blank user/i }));
    fireEvent.click(screen.getByRole("button", { name: /Reissue donor case/i }));

    expect(
      screen.getByText(/User input cannot be empty or contain only spaces/i),
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
