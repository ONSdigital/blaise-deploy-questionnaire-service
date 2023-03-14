/**
 * @jest-environment jsdom
 */

import flushPromises from "../../../tests/utils";
import { render, waitFor, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import React from "react";
import ViewCatiModeDetails from "./viewCatiModeDetails";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

describe("View TO Start Date section", () => {
    afterEach(() => {
        mock.reset();
    });

    it("should not render for non-CATI questionnaires", async () => {
        const { container } = render(
            <ViewCatiModeDetails questionnaireName={"OPN2101A"} modes={["CAWI"]} />
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(container.childElementCount).toEqual(0);
        });
    });

    it("should display an error message when it fails to load the TO Start Date", async () => {
        const viewToStartDateFailedMessage = /Failed to get Telephone Operations start date/i;
        mock.onGet("/api/tostartdate/OPN2101A").reply(500);
        render(
            <ViewCatiModeDetails questionnaireName={"OPN2101A"} modes={["CATI"]} />
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(viewToStartDateFailedMessage)).toBeDefined();
        });
    });

});
