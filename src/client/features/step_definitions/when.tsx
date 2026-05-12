import { QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type DefineStepFunction } from "jest-cucumber";
import React from "react";
import { MemoryRouter } from "react-router-dom";

import App from "../../app";
import flushPromises from "../../test-utils/flushPromises";
import { createTestQueryClient } from "../../test-utils/renderWithQueryClient";

import {
  formatDateString,
  navigatePastSettingTOStartDateAndDeployQuestionnaire,
} from "./helpers/functions";

export function whenIConfirmMySelection(when: DefineStepFunction): void {
  when("I confirm my selection", async () => {
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenIConfirmMySelectionNoWait(when: DefineStepFunction): void {
  when("I confirm my selection", async () => {
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
  });
}

export function whenISelectTo(when: DefineStepFunction): void {
  when(/I select to '(.*)'/, async (button: string) => {
    if (button == "cancel") {
      await userEvent.click(screen.getByText("Cancel and keep original questionnaire"));
      await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    }
  });
}

export function whenILoadTheHomepage(when: DefineStepFunction): void {
  when("I load the homepage", async () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenIGoToTheQuestionnaireDetailsPage(when: DefineStepFunction): void {
  when(/I go to the questionnaire details page for '(.*)'/, async (questionnaire: string) => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await act(async () => {
      await flushPromises();
    });

    const questionnaireLink =
      (await screen.findByRole("link", { name: questionnaire }).catch(() => null)) ??
      (await screen.findByText(questionnaire));

    await act(async () => {
      await userEvent.click(questionnaireLink);
      await flushPromises();
    });

    await waitFor(() => screen.getByRole("heading", { level: 1, name: questionnaire }));
  });
}

export function whenIDeleteAQuestionnaire(when: DefineStepFunction): void {
  when(/I select a link to delete the '(.*)' questionnaire/, async (questionnaire: string) => {
    await waitFor(() => {
      expect(document.querySelector("#delete-questionnaire")).not.toBeNull();
    });

    const deleteControl =
      (document.querySelector("#delete-questionnaire") as HTMLElement | null) ??
      (await screen.findByLabelText(new RegExp(`Delete questionnaire ${questionnaire}`, "i")));

    await act(async () => {
      await userEvent.click(deleteControl);
    });

    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenIConfirmDelete(when: DefineStepFunction): void {
  when("I confirm that I want to proceed", async () => {
    await waitFor(() => {
      expect(document.querySelector("#confirm-delete")).not.toBeNull();
    });

    const confirmDeleteButton =
      (document.querySelector("#confirm-delete") as HTMLElement | null) ??
      (await screen.findByRole("button", { name: /^Delete$/i }));

    await act(async () => {
      await userEvent.click(confirmDeleteButton);
    });
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenICancelDelete(when: DefineStepFunction): void {
  when("I click cancel", async () => {
    await waitFor(() => {
      expect(document.querySelector("#cancel-delete")).not.toBeNull();
    });

    const cancelDeleteButton =
      (document.querySelector("#cancel-delete") as HTMLElement | null) ??
      (await screen.findByRole("button", { name: /^Cancel$/i }));

    await userEvent.click(cancelDeleteButton);
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenISelectTheQuestionnaire(when: DefineStepFunction): void {
  when(/I select the questionnaire '(.*)'/, async (questionnaire: string) => {
    await act(async () => {
      await userEvent.click(screen.getByText(questionnaire));
    });
    await waitFor(() => screen.getByRole("heading", { level: 1, name: questionnaire }));
  });
}

export function whenISelectToChangeOrDeleteToStartDate(when: DefineStepFunction): void {
  when("I select to change or delete the TO Start Date", async () => {
    await act(async () => {
      await flushPromises();
    });
    await userEvent.click(screen.getByRole("link", { name: /Change or delete start date/i }));
    await waitFor(() =>
      screen.getByRole("heading", {
        level: 1,
        name: /Would you like to set a Telephone Operations start date/i,
      }),
    );
  });
}

export function whenIHaveSelectedToAddAToStartDate(when: DefineStepFunction): void {
  when("I have selected to add a TO Start Date", async () => {
    await act(async () => {
      await flushPromises();
    });
    await userEvent.click(screen.getByRole("link", { name: /Add a start date/i }));
    await waitFor(() =>
      screen.getByRole("heading", {
        level: 1,
        name: /Would you like to set a Telephone Operations start date/i,
      }),
    );
  });
}

export function whenIHaveSelectedToAddATotalmobileReleaseDate(when: DefineStepFunction): void {
  when("I have selected to add a Totalmobile release date", async () => {
    await act(async () => {
      await flushPromises();
    });
    await userEvent.click(screen.getByRole("link", { name: /Add a release date/i }));
    await waitFor(() =>
      screen.getByRole("heading", {
        level: 1,
        name: /Would you like to set a Totalmobile release date/i,
      }),
    );
  });
}

export function whenISpecifyATOStartDateOf(when: DefineStepFunction): void {
  when(/I specify the TO start date of '(.*)'/, async (toStartDate: string) => {
    await userEvent.click(screen.getByLabelText(/Yes, let me specify a start date/i));
    fireEvent.change(screen.getByLabelText(/Please specify date/i), {
      target: { value: formatDateString(toStartDate) },
    });
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenIDeleteTheToStartDate(when: DefineStepFunction): void {
  when("I delete the TO start date", async () => {
    await userEvent.click(screen.getByLabelText(/No start date/i));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenIDeleteTheTotalmobileReleaseDate(when: DefineStepFunction): void {
  when("I delete the Totalmobile release date", async () => {
    await userEvent.click(screen.getByLabelText(/No release date/i));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenISelectToInstallWithNoStartDate(when: DefineStepFunction): void {
  when("I select to not provide a TO Start Date", async () => {
    await userEvent.click(screen.getByLabelText(/No start date/i));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenISelectTheContinueButton(when: DefineStepFunction): void {
  when("I select the continue button", async () => {
    await act(async () => {
      await flushPromises();
    });
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenIClickGenerateCases(when: DefineStepFunction): void {
  when("I click generate cases", async () => {
    await act(async () => {
      await flushPromises();
    });
    await userEvent.click(screen.getByText(/Generate and download Unique Access Codes/i));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenISelectToOverwrite(when: DefineStepFunction): void {
  when("I select to 'overwrite'", async () => {
    await userEvent.click(screen.getByText(/overwrite the entire questionnaire/i));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenIConfirmToOverwrite(when: DefineStepFunction): void {
  when("I confirm 'overwrite'", async () => {
    await userEvent.click(screen.getByText(/yes, overwrite questionnaire/i));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    await act(async () => {
      await flushPromises();
    });

    await navigatePastSettingTOStartDateAndDeployQuestionnaire();
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenIConfirmNotToOverwrite(when: DefineStepFunction): void {
  when("I confirm that I do NOT want to continue", async () => {
    await userEvent.click(screen.getByText(/no, do not overwrite questionnaire/i));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
  });
}

export function whenISearchForAQuestionnaire(when: DefineStepFunction): void {
  when(/I enter the '(.*)' in the search box/, async (questionnaire: string) => {
    if (questionnaire.length > 0) {
      await userEvent.type(screen.getByLabelText(/Filter by questionnaire name/i), questionnaire);
    }

    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenIDeployTheQuestionnaire(when: DefineStepFunction): void {
  when("I deploy the questionnaire", async () => {
    await userEvent.click(screen.getByRole("button", { name: /Deploy questionnaire/i }));

    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenIClickDeployNewQuestionnaire(when: DefineStepFunction): void {
  when("I click deploy questionnaire", async () => {
    await act(async () => {
      await flushPromises();
    });
    await userEvent.click(screen.getByRole("link", { name: /^Deploy questionnaire$/i }));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenIHaveSelectedADeployPackage(then: DefineStepFunction): void {
  then(/I have selected a deploy package for '(.*)'/, async (questionnaire: string) => {
    const input = screen.getByLabelText(/Select questionnaire package/i);

    const file = new File(["(⌐□_□)"], `${questionnaire}.bpkg`, { type: "application/zip" });

    await userEvent.upload(input, file);
  });
}

export function whenIChooseToDeployAnyway(when: DefineStepFunction): void {
  when("I choose to deploy anyway", async () => {
    await userEvent.click(await screen.getByRole("button", { name: /Deploy anyway/i }));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenIChooseToCancel(when: DefineStepFunction): void {
  when("I choose to cancel", async () => {
    await userEvent.click(await screen.getByRole("button", { name: /Cancel/i }));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenIDeploy(when: DefineStepFunction): void {
  when("I deploy", async () => {
    await act(async () => {
      await flushPromises();
    });

    const noStartDate = screen.queryByLabelText(/No start date/i);

    if (noStartDate) {
      await userEvent.click(noStartDate);
      await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    }

    await act(async () => {
      await flushPromises();
    });

    await userEvent.click(screen.getByRole("button", { name: /Deploy questionnaire/i }));

    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenISpecifyATotalmobileReleaseDateOf(when: DefineStepFunction): void {
  when(/I specify the Totalmobile release date of '(.*)'/, async (toStartDate: string) => {
    await userEvent.click(screen.getByLabelText(/Yes, let me specify a release date/i));
    fireEvent.change(screen.getByLabelText(/Please specify date/i), {
      target: { value: formatDateString(toStartDate) },
    });
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenISelectToInstallWithNoTmReleaseDate(when: DefineStepFunction): void {
  when("I select to not provide a Totalmobile release date", async () => {
    await userEvent.click(screen.getByLabelText(/No release date/i));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenISelectToChangeOrDeleteTotalmobileReleaseDate(when: DefineStepFunction): void {
  when("I select to change or delete the Totalmobile release date", async () => {
    await act(async () => {
      await flushPromises();
    });
    await userEvent.click(screen.getByRole("link", { name: /Change or delete release date/i }));
    await waitFor(() =>
      screen.getByRole("heading", {
        level: 1,
        name: /Would you like to set a Totalmobile release date/i,
      }),
    );
  });
}
