/**
 * @jest-environment jsdom
 */

import flushPromises from "../../../tests/utils";
import { render, waitFor, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import React from "react";
import CawiModeDetails from "./cawiModeDetails";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { opnQuestionnaire } from "../../../features/step_definitions/helpers/apiMockObjects";

const mock = new MockAdapter(axios);

describe("CAWI mode details", () => {
    afterEach(() => {
        mock.reset();
    });

    it("should not render for non-CAWI questionnaires", async () => {
        const { container } = render(
            <CawiModeDetails questionnaire={opnQuestionnaire} modes={["CATI"]} />
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(container.childElementCount).toEqual(0);
        });
    });

    it("should display an error message when it fails to load the generated UACs", async () => {
        const viewGeneratedUacsFailedMessage = /Failed to get Web mode details/i;
        mock.onGet("/api/uacs/questionnaire/OPN2004A/count").reply(500);
        render(
            <CawiModeDetails questionnaire={opnQuestionnaire} modes={["CAWI"]} />
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(viewGeneratedUacsFailedMessage)).toBeDefined();
        });
    });
});
