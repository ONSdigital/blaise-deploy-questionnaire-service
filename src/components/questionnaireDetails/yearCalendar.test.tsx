/**
 * @jest-environment jsdom
 */

import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import flushPromises from "../../tests/utils";
import YearCalendar from "./yearCalendar";
import userEvent from "@testing-library/user-event";

describe("Year calendar for mixed and CATI mode", () => {
    afterEach(() => {
        cleanup();
    });

    const surveyDays = [
        "24 Dec 1997 00:00:00 GMT",
        "20 Dec 1997 00:00:00 GMT"
    ];

    const modes = [
        "CATI",
        "CAWI"
    ];

    it("should render calendar with the year set as the newest date in survey list specified ", async () => {
        render(
            <YearCalendar modes={modes} surveyDays={surveyDays} />
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/1997/i)).toBeDefined();
        });
    });

    it("should go back a year when you press the back button («)", async () => {
        render(
            <YearCalendar modes={modes} surveyDays={surveyDays} />
        );

        await act(async () => {
            await flushPromises();
        });

        userEvent.click(screen.getByText("«"));

        await waitFor(() => {
            expect(screen.getByText(/1996/i)).toBeDefined();
        });
    });

    it("should go forward a year when you press the forward button (»)", async () => {
        render(
            <YearCalendar modes={modes} surveyDays={surveyDays} />
        );

        await act(async () => {
            await flushPromises();
        });

        userEvent.click(screen.getByText("»"));

        await waitFor(() => {
            expect(screen.getByText(/1998/i)).toBeDefined();
        });
    });
});

describe("Year calendar for anything except CATI mode", () => {
    afterEach(() => {
        cleanup();
    });

    const surveyDays = [
        "24 Dec 1997 00:00:00 GMT",
        "20 Dec 1997 00:00:00 GMT"
    ];

    const modes = [
        "CAWI"
    ];

    it("should not render a Survey Days Calendar", async () => {
        const { container } = render(
            <YearCalendar modes={modes} surveyDays={surveyDays} />
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(container.childElementCount).toEqual(0);
        });
    });
});
