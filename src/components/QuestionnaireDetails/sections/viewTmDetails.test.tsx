/**
 * @jest-environment jsdom
 */

import flushPromises from "../../../tests/utils";
import { render, waitFor, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import React from "react";
import ViewTmDetails from "./viewTmDetails";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

describe("View TM Release Date section", () => {
    afterEach(() => {
        mock.reset();
    });

    it("should not render for non-LMS questionnaires", async () => {
        const { container } = render(
            <ViewTmDetails questionnaireName={"OPN2101A"} />
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(container.childElementCount).toEqual(0);
        });
    });

    it("should display an error message when it fails to load the TM Release Date", async () => {
        const viewTmReleaseDateFailedMessage = /Failed to get Totalmobile release date/i;
        mock.onGet("/api/tmreleasedate/OPN2101A").reply(500);
        render(
            <ViewTmDetails questionnaireName={"OPN2101A"}/>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(viewTmReleaseDateFailedMessage)).toBeDefined();
        });
    });

});
