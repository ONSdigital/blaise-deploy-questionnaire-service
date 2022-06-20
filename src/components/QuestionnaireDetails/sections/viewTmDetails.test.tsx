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


    it("should render for LMS questionnaires", async () => {
        const viewOnScreen = /Totalmobile/i;
        mock.onGet("/api/tmreleasedate/LMS2101_AA1").reply(500);
        render(
            <ViewTmDetails questionnaireName={"LMS2101_AA1"} />
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(viewOnScreen)).toBeDefined();
        });
    });

});
