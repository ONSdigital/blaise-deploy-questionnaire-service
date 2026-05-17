import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

import { ConfirmOverride } from "./confirmOverride";

vi.mock("blaise-design-system-react-components", () => ({
  Panel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("ConfirmOverride", () => {
  it("renders the overwrite warning", () => {
    render(<ConfirmOverride questionnaireName="OPN2004A" />);

    expect(
      screen.getByText(
        (_, element) =>
          (element?.textContent ?? "").includes(
            "Are you sure you want to overwrite questionnaire OPN2004A?",
          ),
        { selector: "h1" },
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/All questionnaire data will be deleted/i)).toBeInTheDocument();
  });
});
