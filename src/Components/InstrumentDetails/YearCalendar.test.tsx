import React from "react";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {act} from "react-dom/test-utils";
import flushPromises from "../../tests/utils";
import YearCalendar from "./YearCalendar";

describe("Year calendar", () => {
    const surveyDays = [
        "24 Dec 1997 00:00:00 GMT",
        "20 Dec 1997 00:00:00 GMT"
    ];

    it("should render calendar with the year set as the newest date in survey list specified ", async () => {
        render(
            <YearCalendar surveyDays={surveyDays}/>
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
            <YearCalendar surveyDays={surveyDays}/>
        );

        await act(async () => {
            await flushPromises();
        });

        await fireEvent.click(screen.getByText("«"));

        await waitFor(() => {
            expect(screen.getByText(/1996/i)).toBeDefined();
        });
    });

     it("should go forward a year when you press the forward button (»)", async () => {
        render(
            <YearCalendar surveyDays={surveyDays}/>
        );

        await act(async () => {
            await flushPromises();
        });

        await fireEvent.click(screen.getByText("»"));

        await waitFor(() => {
            expect(screen.getByText(/1998/i)).toBeDefined();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
