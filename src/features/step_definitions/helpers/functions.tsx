import { createMemoryHistory } from "history";
import { act, render, screen } from "@testing-library/react";
import { Router } from "react-router";
import App from "../../../App";
import flushPromises from "../../../tests/utils";
import React from "react";
import userEvent from "@testing-library/user-event";


export async function renderHomepage(): Promise<void> {
    const history = createMemoryHistory();
    render(
        <Router history={history}>
            <App />
        </Router>
    );
    await act(async () => {
        await flushPromises();
    });
}

/*
* Renders the App in a Mock Router, then navigates the the 'Deploy a questionnaire' page
* and then selects a mock OPN2004A.bpkg in the File select Input field.
*  */
export default async function navigateToDeployPageAndSelectFile(questionnaire = "OPN2004A"): Promise<void> {
    const history = createMemoryHistory();
    render(
        <Router history={history}>
            <App />
        </Router>
    );
    await act(async () => {
        await flushPromises();
    });

    userEvent.click(screen.getByText(/Deploy a questionnaire/i));

    const input = screen.getByLabelText(/Select survey package/i);

    const file = new File(["(⌐□_□)"], `${questionnaire}.bpkg`, { type: "application/zip" });

    userEvent.upload(input, file);
}

export async function navigatePastSettingTOStartDateAndStartDeployment(): Promise<void> {
    await act(async () => {
        await flushPromises();
    });
    userEvent.click(screen.getByText(/No start date/i));
    userEvent.click(screen.getByText(/Continue/));

    await act(async () => {
        await flushPromises();
    });

    userEvent.click(screen.getByText(/Deploy questionnaire/));

    await act(async () => {
        await flushPromises();
    });
}

export function mock_fetch_requests(mock_server_responses: any): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn((url: string, config: any) => mock_server_responses(url, config));
}

export function mock_builder(mock_list: Record<string, Promise<any>>): (url: string, config?: any) => (Promise<any>) {
    return (url: string, config?: any): Promise<any> => {
        console.log(url);
        console.log(config);
        if (config && config.method) {
            if (`${url}:${config.method}` in mock_list) {
                return mock_list[`${url}:${config.method}`];
            }
        }
        if (url in mock_list) {
            return mock_list[url];
        }
        for (const mock_path in mock_list) {
            const path = mock_path.split(":")[0];
            const method = mock_path.split(":")[1];

            if (method !== undefined) {
                if (url.includes(path) && config.method === method) {
                    return mock_list[mock_path];
                }
            }

            if (url.includes(mock_path)) {
                return mock_list[mock_path];
            }
        }
        return Promise.reject("No matching mock");
    };
}

export function format_date_string(date: string): string {
    const splitDate = date.split("/");
    return `${splitDate[2]}-${splitDate[1]}-${splitDate[0]}`;
}
