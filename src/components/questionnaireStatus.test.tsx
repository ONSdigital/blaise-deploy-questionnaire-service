/**
 * @jest-environment jsdom
 */

import React from "react";
import { cleanup, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import QuestionnaireStatus from "./questionnaireStatus";

describe("Questionnaire Status ", () => {
    afterEach(() => {
        cleanup();
    });

    it("should render questionnaire with class 'ons-status--success' when the status is Active", async () => {
        const { container } = render(
            <QuestionnaireStatus status={"Active"} />
        );

        expect(container.firstChild).toHaveClass("ons-status--success");
    });

    it("should render questionnaire with class 'ons-status--error' when the status is Erroneous", async () => {
        const { container } = render(
            <QuestionnaireStatus status={"Failed"} />
        );

        expect(container.firstChild).toHaveClass("ons-status--error");
    });

    it("should render questionnaire with class 'ons-status--error' when the status is Failed", async () => {
        const { container } = render(
            <QuestionnaireStatus status={"Failed"} />
        );

        expect(container.firstChild).toHaveClass("ons-status--error");
    });

    it("should render questionnaire with class 'ons-status--info' when the status is not known", async () => {
        const { container } = render(
            <QuestionnaireStatus status={"Bacon"} />
        );

        expect(container.firstChild).toHaveClass("ons-status--info");
    });
});
