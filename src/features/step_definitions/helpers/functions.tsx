import { createMemoryHistory } from "history";
import { act, render, screen } from "@testing-library/react";
import { Router } from "react-router";
import App from "../../../app";
import flushPromises from "../../../tests/utils";
import React from "react";
import userEvent from "@testing-library/user-event";

/*
* Renders the App in a Mock Router, then navigates the the 'Deploy a questionnaire' page
* and then selects a mock OPN2004A.bpkg in the File select Input field.
*  */
export async function navigateToDeployPageAndSelectFile(questionnaire = "OPN2004A"): Promise<void> {
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

export default async function navigateToDeployPageAndSelectFileAndContinue(questionnaire = "OPN2004A"): Promise<void> {
    await navigateToDeployPageAndSelectFile(questionnaire)
    await clickContinue();
}

export async function navigatePastSettingTOStartDateAndDeployQuestionnaire(): Promise<void> {
    await selectNoTOStartDateAndContinue();
    await clickContinue();
    await clickDeployQuestionnaire();
}

export async function navigateToSetTMReleaseDatePageAndContinue(questionnaire: string): Promise<void> {
    await navigateToDeployPageAndSelectFile(questionnaire);
    await clickContinue();

    // TO start date page
    await selectNoTOStartDateAndContinue();
    await clickContinue();
}

export async function selectNoTOStartDateAndContinue(): Promise<void> {
    userEvent.click(screen.getByText(/No start date/i));
}

export async function selectNoTMReleaseDateAndContinue(): Promise<void> {
    userEvent.click(screen.getByText(/No release date/i));
    userEvent.click(screen.getByText(/Continue/));
    await act(async () => {
        await flushPromises();
    });
}

export async function clickDeployQuestionnaire(): Promise<void> {
    userEvent.click(screen.getByText(/Deploy questionnaire/));
    await act(async () => {
        await flushPromises();
    });
}

export async function clickContinue(): Promise<void> {
    userEvent.click(screen.getByText(/Continue/));
    await act(async () => {
        await flushPromises();
    });
}

export function formatDateString(date: string): string {
    const splitDate = date.split("/");
    return `${splitDate[2]}-${splitDate[1]}-${splitDate[0]}`;
}
