import {createMemoryHistory} from "history";
import {act, fireEvent, render, screen} from "@testing-library/react";
import {Router} from "react-router";
import App from "../../App";
import flushPromises from "../../tests/utils";
import React from "react";

/*
* Renders the App in a Mock Router, then navigates the the 'Deploy a questionnaire' page
* and then selects a mock OPN2004A.bpkg in the File select Input field.
*  */
export default async function navigateToDeployPageAndSelectFile() {
    const history = createMemoryHistory();
    render(
        <Router history={history}>
            <App/>
        </Router>
    );
    await act(async () => {
        await flushPromises();
    });

    await fireEvent.click(screen.getByText(/Deploy a questionnaire/i));

    const inputEl = screen.getByLabelText(/Select survey package/i);

    const file = new File(["(⌐□_□)"], "OPN2004A.bpkg", {
        type: "bpkg"
    });

    Object.defineProperty(inputEl, "files", {
        value: [file]
    });

    fireEvent.change(inputEl);
}

export async function navigatePastSettingTOStartDateAndStartDeployment() {
    await act(async () => {
        await flushPromises();
    });
    await fireEvent.click(screen.getByText(/No start date/i));
    await fireEvent.click(screen.getByText(/Continue/));

    await act(async () => {
        await flushPromises();
    });

    await fireEvent.click(screen.getByText(/Deploy questionnaire/));

    await act(async () => {
        await flushPromises();
    });
}

export function mock_fetch_requests(mock_server_responses: any) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn((url: string) => mock_server_responses(url));
}
