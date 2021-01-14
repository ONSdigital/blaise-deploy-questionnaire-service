import {createMemoryHistory} from "history";
import {act, fireEvent, render, screen} from "@testing-library/react";
import {Router} from "react-router";
import App from "../../App";
import flushPromises from "../../tests/utils";
import React from "react";

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

//mock_server_request("OPN2004A.bpkg");
