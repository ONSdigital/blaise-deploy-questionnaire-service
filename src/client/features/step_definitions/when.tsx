import { QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";

type DefineStepFunction = (name: any, callback: any) => void;

import App from "../../app";
import flushPromises from "../../test-utils/flushPromises";
import { createTestQueryClient } from "../../test-utils/renderWithQueryClient";

import {
  formatDateString,
  navigatePastSettingTOStartDateAndDeployQuestionnaire,
} from "./helpers/functions";

export function whenIConfirmMySelection(when: DefineStepFunction): void {
  when("I confirm my selection", async () => {
    await userEvent.click(await screen.findByRole("button", { name: /Continue/i }));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenIConfirmMySelectionNoWait(when: DefineStepFunction): void {
  when("I confirm my selection", async () => {
    await userEvent.click(await screen.findByRole("button", { name: /Continue/i }));
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

    const filterInput = await screen
      .findByLabelText(/Filter by questionnaire name/i)
      .catch(() => null);

    if (filterInput) {
      expect(filterInput).toBeDefined();

      return;
    }

    await screen.findByRole("heading", { name: /View questionnaires/i });
  });
}

export function whenIGoToTheQuestionnaireDetailsPage(when: DefineStepFunction): void {
  when(/I go to the questionnaire details page for '(.*)'/, async (questionnaire: string) => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={[`/questionnaire/${questionnaire}`]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText(questionnaire, { selector: "h1" }, { timeout: 10000 });
  });
}

export function whenIDeleteAQuestionnaire(when: DefineStepFunction): void {
  when(/I select a link to delete the '(.*)' questionnaire/, async (questionnaire: string) => {
    await waitFor(() => {
      expect(document.querySelector("#delete-questionnaire")).not.toBeNull();
    }, { timeout: 10000 });

    const deleteControl = document.querySelector("#delete-questionnaire") as HTMLElement;

    await userEvent.click(deleteControl);

    await waitFor(() => {
      const confirmDeleteButton = document.querySelector("#confirm-delete");
      const erroneousHeading = screen.queryByRole("heading", {
        name: new RegExp(`Unable to delete questionnaire ${questionnaire}`, "i"),
      });

      expect(confirmDeleteButton ?? erroneousHeading).not.toBeNull();
    }, { timeout: 10000 });
  });
}

export function whenIConfirmDelete(when: DefineStepFunction): void {
  when("I confirm that I want to proceed", async () => {
    await waitFor(() => {
      expect(document.querySelector("#confirm-delete")).not.toBeNull();
    }, { timeout: 10000 });

    const confirmDeleteButton =
      (document.querySelector("#confirm-delete") as HTMLElement | null) ??
      (await screen.findByRole("button", { name: /^Delete$/i }));

    await userEvent.click(confirmDeleteButton);
  });
}

export function whenICancelDelete(when: DefineStepFunction): void {
  when("I click cancel", async () => {
    await waitFor(() => {
      expect(document.querySelector("#cancel-delete")).not.toBeNull();
    }, { timeout: 10000 });

    const cancelDeleteButton =
      (document.querySelector("#cancel-delete") as HTMLElement | null) ??
      (await screen.findByRole("button", { name: /^Cancel$/i }));

    await userEvent.click(cancelDeleteButton);
  });
}

export function whenISelectTheQuestionnaire(when: DefineStepFunction): void {
  when(/I select the questionnaire '(.*)'/, async (questionnaire: string) => {
    const detailsLink = await screen.findByRole(
      "link",
      {
        name: new RegExp(`View more information for questionnaire ${questionnaire}`, "i"),
      },
      { timeout: 5000 },
    );

    await act(async () => {
      await userEvent.click(detailsLink);
      await flushPromises();
    });

    await screen.findByText(questionnaire, { selector: "h1" }, { timeout: 10000 });
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
    const addReleaseDateLink =
      screen.queryByRole("link", { name: /Add( a)? release date/i }) ??
      screen.queryByRole("link", { name: /Add.*release date/i });

    if (!addReleaseDateLink) {
      throw new Error("Add release date action is not available");
    }

    await userEvent.click(addReleaseDateLink);
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
    const noReleaseDateOption =
      screen.queryByLabelText(/No.*release date/i) ??
      screen.queryByLabelText(/No.*Totalmobile/i) ??
      screen.getByRole("radio", { name: /No/i });

    await userEvent.click(noReleaseDateOption);
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
    await userEvent.click(
      await screen.findByRole("button", { name: /Generate and download Unique Access Codes/i }),
    );
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenISelectToOverwrite(when: DefineStepFunction): void {
  when("I select to 'overwrite'", async () => {
    await userEvent.click(await screen.findByText(/overwrite the entire questionnaire/i));
    await userEvent.click(await screen.findByRole("button", { name: /Continue/i }));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenIConfirmToOverwrite(when: DefineStepFunction): void {
  when("I confirm 'overwrite'", async () => {
    await userEvent.click(await screen.findByText(/yes, overwrite questionnaire/i));
    await userEvent.click(await screen.findByRole("button", { name: /Continue/i }));
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
    await userEvent.click(await screen.findByText(/no, do not overwrite questionnaire/i));
    await userEvent.click(await screen.findByRole("button", { name: /Continue/i }));
  });
}

export function whenISearchForAQuestionnaire(when: DefineStepFunction): void {
  when(/I enter the '(.*)' in the search box/, async (questionnaire: string) => {
    if (questionnaire.length > 0) {
      await userEvent.type(
        await screen.findByLabelText(/Filter by questionnaire name/i),
        questionnaire,
      );
    }

    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenIDeployTheQuestionnaire(when: DefineStepFunction): void {
  when("I deploy the questionnaire", async () => {
    const isDeploymentOutcomeVisible = (): boolean => {
      return screen.queryByRole("heading", { name: /Questionnaire .* deploy(ed| failed)/i }) != null;
    };

    // Drive the wizard through Continue/Deploy states using the form submit control.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (isDeploymentOutcomeVisible()) {
        return;
      }

      await waitFor(() => {
        expect(
          document.getElementById("continue-deploy-button") ??
            screen.queryByRole("button", { name: /Deploy questionnaire|Deploy anyway|Continue/i }),
        ).not.toBeNull();
      });

      const submitButton =
        document.getElementById("continue-deploy-button") ??
        screen.queryByRole("button", { name: /Deploy questionnaire|Deploy anyway|Continue/i });

      if (!submitButton) {
        throw new Error("No deployment action button was available");
      }

      const buttonText = submitButton.textContent ?? "";

      await userEvent.click(submitButton);
      await act(async () => {
        await flushPromises();
      });

      if (/Deploy questionnaire|Deploy anyway/i.test(buttonText)) {
        return;
      }
    }

    throw new Error("Unable to reach a deployment action within expected steps");
  });
}

export function whenIClickDeployNewQuestionnaire(when: DefineStepFunction): void {
  when("I click deploy questionnaire", async () => {
    await act(async () => {
      await flushPromises();
    });
    const deployLink =
      (await screen.findByRole("link", { name: /deploy questionnaire/i }).catch(() => null)) ??
      (await screen.findByText(/deploy questionnaire/i));

    await userEvent.click(deployLink);
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenIHaveSelectedADeployPackage(then: DefineStepFunction): void {
  then(/I have selected a deploy package for '(.*)'/, async (questionnaire: string) => {
    const input = await screen.findByLabelText(/Select questionnaire package|Select survey package/i);

    const file = new File(["(⌐□_□)"], `${questionnaire}.bpkg`, { type: "application/zip" });

    await userEvent.upload(input, file);
  });
}

export function whenIChooseToDeployAnyway(when: DefineStepFunction): void {
  when("I choose to deploy anyway", async () => {
    const deployAnywayButton = await screen.findByRole("button", { name: /Deploy anyway/i }).catch(() => null);

    if (deployAnywayButton) {
      await userEvent.click(deployAnywayButton);
    } else {
      const continueButton = await screen.findByRole("button", { name: /Continue/i }).catch(() => null);

      if (!continueButton) {
        throw new Error("Deploy anyway action was not available");
      }

      await userEvent.click(continueButton);
      await act(async () => {
        await flushPromises();
      });

      await userEvent.click(await screen.findByRole("button", { name: /Deploy anyway/i }));
    }

    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenIChooseToCancel(when: DefineStepFunction): void {
  when("I choose to cancel", async () => {
    const cancelButton = await screen.findByRole("button", { name: /Cancel/i }).catch(() => null);

    if (cancelButton) {
      await userEvent.click(cancelButton);
    } else {
      const continueButton = await screen.findByRole("button", { name: /Continue/i }).catch(() => null);

      if (!continueButton) {
        throw new Error("Cancel action was not available");
      }

      await userEvent.click(continueButton);
      await act(async () => {
        await flushPromises();
      });

      await userEvent.click(await screen.findByRole("button", { name: /Cancel/i }));
    }

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
      await userEvent.click(await screen.findByRole("button", { name: /Continue/i }));
    }

    await act(async () => {
      await flushPromises();
    });

    await userEvent.click(await screen.findByRole("button", { name: /Deploy questionnaire/i }));

    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenISpecifyATotalmobileReleaseDateOf(when: DefineStepFunction): void {
  when(/I specify the Totalmobile release date of '(.*)'/, async (toStartDate: string) => {
    const yesReleaseDateOption =
      screen.queryByLabelText(/Yes.*release date/i) ??
      screen.getByLabelText(/Yes.*specify.*date/i);

    await userEvent.click(yesReleaseDateOption);

    fireEvent.change(screen.getByLabelText(/Please specify( the)? date/i), {
      target: { value: formatDateString(toStartDate) },
    });
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenISelectToInstallWithNoTmReleaseDate(when: DefineStepFunction): void {
  when("I select to not provide a Totalmobile release date", async () => {
    const noReleaseDateOption =
      screen.queryByLabelText(/No.*release date/i) ??
      screen.queryByLabelText(/No.*Totalmobile/i) ??
      screen.getByRole("radio", { name: /No/i });

    await userEvent.click(noReleaseDateOption);
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
    const changeReleaseDateLink =
      screen.queryByRole("link", { name: /Change or delete release date/i }) ??
      screen.queryByRole("link", { name: /Change.*release date/i });

    if (!changeReleaseDateLink) {
      throw new Error("Change or delete release date action is not available");
    }

    await userEvent.click(changeReleaseDateLink);
    await waitFor(() =>
      screen.getByRole("heading", {
        level: 1,
        name: /Would you like to set a Totalmobile release date/i,
      }),
    );
  });
}
