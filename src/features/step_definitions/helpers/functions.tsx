/* eslint-disable import-x/no-extraneous-dependencies */
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter } from "react-router-dom";

import App from "../../../app";
import flushPromises from "../../../tests/utils";

/*
 * Renders the App in a Mock Router, then navigates the the 'Deploy a questionnaire' page
 * and then selects a mock OPN2004A.bpkg in the File select Input field.
 *  */
export async function navigateToDeployPageAndSelectFile(questionnaire = "OPN2004A"): Promise<void> {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  await act(async () => {
    await flushPromises();
  });

  userEvent.click(screen.getByRole("link", { name: /Deploy a questionnaire/i }));

  const input = await screen.findByLabelText(/Select survey package/i);

  const file = new File(["(⌐□_□)"], `${questionnaire}.bpkg`, { type: "application/zip" });

  userEvent.upload(input, file);
}

export async function navigatePastSettingTOStartDateAndDeployQuestionnaire(): Promise<void> {
  await selectNoTOStartDateAndContinue();
  await clickContinue();
  await clickDeployQuestionnaire();
}

async function selectNoTOStartDateAndContinue(): Promise<void> {
  userEvent.click(screen.getByText(/No start date/i));
}

async function clickDeployQuestionnaire(): Promise<void> {
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
