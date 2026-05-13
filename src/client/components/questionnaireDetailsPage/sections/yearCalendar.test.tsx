import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";

import flushPromises from "../../../test-utils/flushPromises";

import { YearCalendar } from "./yearCalendar";

describe("Year calendar for mixed and CATI mode", () => {
  const surveyDays = ["24 Dec 1997 00:00:00 GMT", "20 Dec 1997 00:00:00 GMT"];

  const modes = ["CATI", "CAWI"];

  it("should render calendar with year controls", async () => {
    render(
      <YearCalendar
        modes={modes}
        surveyDays={surveyDays}
      />,
    );

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(/1997/i)).toBeDefined();
    });

    const decemberRow = screen.getByText("Dec").closest("tr");

    expect(decemberRow).not.toBeNull();
    expect(within(decemberRow as HTMLElement).getByText("24")).toBeDefined();
    expect(within(decemberRow as HTMLElement).getByText("20")).toBeDefined();
  });

  it("should go back a year when you press the back button («)", async () => {
    render(
      <YearCalendar
        modes={modes}
        surveyDays={surveyDays}
      />,
    );

    await act(async () => {
      await flushPromises();
      await userEvent.click(screen.getByRole("button", { name: /Previous year/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/1996/i)).toBeDefined();
    });
  });

  it("should go forward a year when you press the forward button (»)", async () => {
    render(
      <YearCalendar
        modes={modes}
        surveyDays={surveyDays}
      />,
    );

    await act(async () => {
      await flushPromises();
    });

    await userEvent.click(screen.getByRole("button", { name: /Next year/i }));

    await waitFor(() => {
      expect(screen.getByText(/1998/i)).toBeDefined();
    });
  });

  it("should handle invalid survey day values without crashing", async () => {
    render(
      <YearCalendar
        modes={modes}
        surveyDays={["not-a-date", "2025-02-10T00:00:00Z"]}
      />,
    );

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(/2025/i)).toBeDefined();
    });
  });
});

describe("Year calendar for anything except CATI mode", () => {
  const surveyDays = ["24 Dec 1997 00:00:00 GMT", "20 Dec 1997 00:00:00 GMT"];

  const modes = ["CAWI"];

  it("should not render a Survey Days Calendar", async () => {
    const { container } = render(
      <YearCalendar
        modes={modes}
        surveyDays={surveyDays}
      />,
    );

    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });
});
