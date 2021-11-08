import flushPromises, {mock_server_request_Return_JSON} from "../../../tests/utils";
import {render, screen, waitFor} from "@testing-library/react";
import {act} from "react-dom/test-utils";
import React from "react";
import ViewInstrumentSettings from "./ViewInstrumentSettings";
import ViewWebModeDetails from "./ViewWebModeDetails";
import {opnInstrument} from "../../../features/step_definitions/API_Mock_Objects";

describe("View Instrument Settings section", () => {

    const viewInstrumentSettingsFailedMessage = /Failed to get questionnaire settings/i;
    beforeAll(() => {
        mock_server_request_Return_JSON(500, {});
    });

    it("should display an error message when it fails to load the Instrument Modes", async () => {
        render(
            <ViewInstrumentSettings instrument={opnInstrument}/>
    );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(viewInstrumentSettingsFailedMessage)).toBeDefined();
        });
    });

    it("should display an error message when it fails to load the Instrument Settings", async () => {
        render(
            <ViewInstrumentSettings instrument={"OPN2101A"}/>
    );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(viewInstrumentSettingsFailedMessage)).toBeDefined();
        });
    });
});
