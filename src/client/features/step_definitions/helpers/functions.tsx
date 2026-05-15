import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { act, type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

import App from "../../../app";
import flushPromises from "../../../test-utils/flushPromises";
import { createWrapper } from "../../../test-utils/renderWithQueryClient";

/*
 * Renders the app in a mock router, then navigates the the 'Deploy questionnaire' page
 * and then selects a mock OPN2004A.bpkg in the file select input field.
 *  */
export async function navigateToDeployPageAndSelectFile(questionnaire = "OPN2004A"): Promise<void> {
  function DeployRouteWrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={["/deploy"]}>{children}</MemoryRouter>;
  }

  render(<App />, { wrapper: createWrapper(DeployRouteWrapper) });
  await act(async () => {
    await flushPromises();
  });

  let input = await screen
    .findByLabelText(/Select questionnaire package|Select survey package/i)
    .catch(() => null);

  if (!input) {
    input = (await waitFor(
      () => {
        const fileInput =
          (document.querySelector("#survey-selector") as HTMLInputElement | null) ??
          (document.querySelector("input[type='file']") as HTMLInputElement | null);

        if (!fileInput) {
          throw new Error("Questionnaire package file input not found");
        }

        return fileInput;
      },
      { timeout: 5000 },
    )) as HTMLInputElement;
  }

  if (!input) {
    throw new Error("Questionnaire package file input not found");
  }

  const file = new File(["(⌐□_□)"], `${questionnaire}.bpkg`, { type: "application/zip" });

  await userEvent.upload(input, file);
}

export async function navigatePastSettingToStartDateAndDeployQuestionnaire(): Promise<void> {
  await selectNoToStartDateAndContinue();
  await clickContinue();
  await clickDeployQuestionnaire();
}

async function selectNoToStartDateAndContinue(): Promise<void> {
  await userEvent.click(screen.getByLabelText(/No start date/i));
}

async function clickDeployQuestionnaire(): Promise<void> {
  await userEvent.click(screen.getByRole("button", { name: /Deploy questionnaire/i }));
  await act(async () => {
    await flushPromises();
  });
}

export async function clickContinue(): Promise<void> {
  await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
  await act(async () => {
    await flushPromises();
  });
}

export function formatDateString(date: string): string {
  const splitDate = date.split("/");

  return `${splitDate[2]}-${splitDate[1]}-${splitDate[0]}`;
}
