import React from "react";
import {cleanup, render} from "@testing-library/react";
import "@testing-library/jest-dom";
import InstrumentStatus from "./InstrumentStatus";

describe("Instrument Status ", () => {

    it("should render instrument with class 'status--success' when the status is Active", async () => {
        const {container} = render(
            <InstrumentStatus status={"Active"}/>
        );

        expect(container.firstChild).toHaveClass("status--success");
    });

    it("should render instrument with class 'status--error' when the status is Erroneous", async () => {
        const {container} = render(
            <InstrumentStatus status={"Erroneous"}/>
        );

        expect(container.firstChild).toHaveClass("status--error");
    });

    it("should render instrument with class 'status--error' when the status is Failed", async () => {
        const {container} = render(
            <InstrumentStatus status={"Erroneous"}/>
        );

        expect(container.firstChild).toHaveClass("status--error");
    });

    it("should render instrument with class 'status--info' when the status is not known", async () => {
        const {container} = render(
            <InstrumentStatus status={"Bacon"}/>
        );

        expect(container.firstChild).toHaveClass("status--info");
    });



    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
