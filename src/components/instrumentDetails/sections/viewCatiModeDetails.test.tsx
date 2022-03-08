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
    const viewToStartDateFailedMessage = /Failed to get Telephone Operations start date/i;

    beforeEach(() => {
        mock.onGet("/api/tostartdate/OPN2101A").reply(500);
    });

    afterEach(() => {
        mock.reset();
    });

    it("should display an error message when it fails to load the TO Start Date", async () => {
        render(
            <ViewCatiModeDetails instrumentName={"OPN2101A"} />
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(viewToStartDateFailedMessage)).toBeDefined();
        });
    });

});
