import flushPromises, {mock_server_request_Return_JSON} from "../../../tests/utils";
import {render, waitFor, screen} from "@testing-library/react";
import {act} from "react-dom/test-utils";
import React from "react";
import ViewToStartDate from "./ViewToStartDate";


describe("View TO Start Date section", () => {

    const viewToStartDateFailedMessage = /Failed to get Telephone Operations start date/i;
    beforeAll(() => {
        mock_server_request_Return_JSON(500, {});
    });

    it("should display an error message when it fails to load the TO Start Date", async () => {
        render(
            <ViewToStartDate instrumentName={"OPN2101A"}/>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(viewToStartDateFailedMessage)).toBeDefined();
        });
    });
});
