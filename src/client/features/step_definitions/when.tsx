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
  navigatePastSettingToStartDateAndDeployQuestionnaire,
} from "./helpers/functions";

export function whenConfirmSelection(when: DefineStepFunction): void {
  when("I confirm my selection", async () => {
    await userEvent.click(await screen.findByRole("button", { name: /Continue/i }));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenConfirmSelectionNoFlush(when: DefineStepFunction): void {
  when("I confirm my selection", async () => {
    await userEvent.click(await screen.findByRole("button", { name: /Continue/i }));
  });
}

export function whenCancelDeployment(when: DefineStepFunction): void {
  when(/I select to '(.*)'/, async (button: string) => {
    if (button == "cancel") {
      await userEvent.click(await screen.findByRole("button", { name: /^Cancel$/i }));
    }
  });
}

export function whenLoadHomepage(when: DefineStepFunction): void {
  when("I load the homepage", async () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByLabelText(/Filter by questionnaire name/i);
  });
}

export function whenGoToDetailsPage(when: DefineStepFunction): void {
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

export function whenClickDelete(when: DefineStepFunction): void {
  when(/I select a link to delete the '(.*)' questionnaire/, async (questionnaire: string) => {
    await waitFor(
      () => {
        expect(document.querySelector("#delete-questionnaire")).not.toBeNull();
      },
      { timeout: 10000 },
    );

    const deleteControl = document.querySelector("#delete-questionnaire") as HTMLElement;

    await userEvent.click(deleteControl);

    await waitFor(
      () => {
        const confirmDeleteButton = document.querySelector("#confirm-delete");
        const erroneousHeading = screen.queryByRole("heading", {
          name: new RegExp(`Unable to delete questionnaire ${questionnaire}`, "i"),
        });

        expect(confirmDeleteButton ?? erroneousHeading).not.toBeNull();
      },
      { timeout: 10000 },
    );
  });
}

export function whenConfirmDeletion(when: DefineStepFunction): void {
  when("I confirm that I want to proceed", async () => {
    await waitFor(
      () => {
        expect(document.querySelector("#confirm-delete")).not.toBeNull();
      },
      { timeout: 10000 },
    );

    const confirmDeleteButton = document.querySelector("#confirm-delete") as HTMLElement;

    await userEvent.click(confirmDeleteButton);
  });
}

export function whenCancelDeletion(when: DefineStepFunction): void {
  when("I click cancel", async () => {
    await waitFor(
      () => {
        expect(document.querySelector("#cancel-delete")).not.toBeNull();
      },
      { timeout: 10000 },
    );

    const cancelDeleteButton = document.querySelector("#cancel-delete") as HTMLElement;

    await userEvent.click(cancelDeleteButton);
  });
}

export function whenSelectQuestionnaire(when: DefineStepFunction): void {
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

export function whenEditToStartDate(when: DefineStepFunction): void {
  when("I select to change or delete the Telephone Operations start date", async () => {
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

export function whenAddToStartDate(when: DefineStepFunction): void {
  when("I have selected to add a Telephone Operations start date", async () => {
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

export function whenAddTmReleaseDate(when: DefineStepFunction): void {
  when("I have selected to add a Totalmobile release date", async () => {
    await act(async () => {
      await flushPromises();
    });
    await userEvent.click(
      await screen.findByRole("link", { name: /^Add a release date for questionnaire /i }),
    );
    await waitFor(() =>
      screen.getByRole("heading", {
        level: 1,
        name: /Would you like to set a Totalmobile release date/i,
      }),
    );
  });
}

export function whenSpecifyToStartDate(when: DefineStepFunction): void {
  when(/I specify the Telephone Operations start date of '(.*)'/, async (toStartDate: string) => {
    await userEvent.click(screen.getByLabelText(/Yes, let me specify a start date/i));
    fireEvent.change(screen.getByLabelText(/Please specify date/i), {
      target: { value: formatDateString(toStartDate) },
    });
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenDeleteToStartDate(when: DefineStepFunction): void {
  when("I delete the Telephone Operations start date", async () => {
    await userEvent.click(screen.getByLabelText(/No start date/i));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenDeleteTmReleaseDate(when: DefineStepFunction): void {
  when("I delete the Totalmobile release date", async () => {
    await userEvent.click(screen.getByLabelText(/^No release date$/i));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenSkipToStartDate(when: DefineStepFunction): void {
  when("I select to not provide a Telephone Operations start date", async () => {
    await userEvent.click(screen.getByLabelText(/No start date/i));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenClickContinue(when: DefineStepFunction): void {
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

export function whenClickGenerateUacs(when: DefineStepFunction): void {
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

export function whenProceedToOverwrite(when: DefineStepFunction): void {
  when("I select to 'overwrite'", async () => {
    await userEvent.click(await screen.findByRole("button", { name: /Continue/i }));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenConfirmOverwrite(when: DefineStepFunction): void {
  when("I confirm 'overwrite'", async () => {
    await userEvent.click(await screen.findByRole("button", { name: /Continue/i }));
    await act(async () => {
      await flushPromises();
    });

    await navigatePastSettingToStartDateAndDeployQuestionnaire();
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenCancelOverwrite(when: DefineStepFunction): void {
  when("I confirm that I do NOT want to continue", async () => {
    await userEvent.click(await screen.findByRole("button", { name: /^Cancel$/i }));
  });
}

export function whenSearchForQuestionnaire(when: DefineStepFunction): void {
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

export function whenDeployQuestionnaire(when: DefineStepFunction): void {
  when("I deploy the questionnaire", async () => {
    const isDeploymentOutcomeVisible = (): boolean => {
      return (
        screen.queryByRole("heading", { name: /Questionnaire .* deploy(ed| failed)/i }) != null
      );
    };

    // Drive the wizard through Continue/Deploy states using the form submit control.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (isDeploymentOutcomeVisible()) {
        return;
      }

      await waitFor(() => {
        expect(document.getElementById("continue-deploy-button")).not.toBeNull();
      });

      const submitButton = document.getElementById("continue-deploy-button");

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

export function whenClickDeployNew(when: DefineStepFunction): void {
  when("I click deploy questionnaire", async () => {
    await act(async () => {
      await flushPromises();
    });

    await userEvent.click(await screen.findByRole("link", { name: /^Deploy questionnaire$/i }));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenSelectDeployPackage(then: DefineStepFunction): void {
  then(/I have selected a deploy package for '(.*)'/, async (questionnaire: string) => {
    const input = await screen.findByLabelText(
      /Select questionnaire package|Select survey package/i,
    );

    const file = new File(["(⌐□_□)"], `${questionnaire}.bpkg`, { type: "application/zip" });

    await userEvent.upload(input, file);
  });
}

export function whenDeployAnyway(when: DefineStepFunction): void {
  when("I choose to deploy anyway", async () => {
    await userEvent.click(await screen.findByRole("button", { name: /^Deploy anyway$/i }));

    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenChooseCancel(when: DefineStepFunction): void {
  when("I choose to cancel", async () => {
    await userEvent.click(await screen.findByRole("button", { name: /^Cancel$/i }));

    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenDeploy(when: DefineStepFunction): void {
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

export function whenSpecifyTmReleaseDate(when: DefineStepFunction): void {
  when(/I specify the Totalmobile release date of '(.*)'/, async (toStartDate: string) => {
    await userEvent.click(screen.getByLabelText(/^Yes, let me specify a release date$/i));

    fireEvent.change(screen.getByLabelText(/^Please specify date$/i), {
      target: { value: formatDateString(toStartDate) },
    });
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenSkipTmReleaseDate(when: DefineStepFunction): void {
  when("I select to not provide a Totalmobile release date", async () => {
    await userEvent.click(screen.getByLabelText(/^No release date$/i));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    await act(async () => {
      await flushPromises();
    });
  });
}

export function whenEditTmReleaseDate(when: DefineStepFunction): void {
  when("I select to change or delete the Totalmobile release date", async () => {
    await act(async () => {
      await flushPromises();
    });
    await userEvent.click(
      await screen.findByRole("link", {
        name: /^Change or delete release date for questionnaire /i,
      }),
    );
    await waitFor(() =>
      screen.getByRole("heading", {
        level: 1,
        name: /Would you like to set a Totalmobile release date/i,
      }),
    );
  });
}
