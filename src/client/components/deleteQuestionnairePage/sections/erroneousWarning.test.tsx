import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { ErroneousWarning } from "./erroneousWarning";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useNavigate: () => mockNavigate,
}));

describe("ErroneousWarning", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the failed-state warning and navigates back to questionnaires", () => {
    render(<ErroneousWarning questionnaireName="OPN2004A" />);

    expect(
      screen.getByText(
        (_, element) =>
          (element?.textContent ?? "").includes(
            "Unable to delete questionnaire OPN2004A because it is in a failed state.",
          ),
        { selector: "h1" },
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/report this issue/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /View questionnaires/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
