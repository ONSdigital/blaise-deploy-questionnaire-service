/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";

import flushPromises from "../../../tests/utils";

import YearCalendar from "./yearCalendar";

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

    expect(screen.getByText("24")).toBeDefined();
    expect(screen.getByText("20")).toBeDefined();
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
      userEvent.click(screen.getByText("«"));
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

    userEvent.click(screen.getByText("»"));

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
