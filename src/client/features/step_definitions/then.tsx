import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";

type DefineStepFunction = (name: any, callback: any) => void;

import flushPromises from "../../test-utils/flushPromises";

import { formatDateString } from "./helpers/functions";

import type MockAdapter from "axios-mock-adapter/types";

export function thenCancelOrOverwriteOptions(then: DefineStepFunction): void {
  then("I am presented with the options to cancel or overwrite the questionnaire", async () => {
    expect(await screen.findByText(/already exists/i)).toBeDefined();
    expect(await screen.findByRole("button", { name: /Continue/i })).toBeDefined();
    expect(await screen.findByRole("button", { name: /^Cancel$/i })).toBeDefined();
  });
}

export function thenReturnedToLandingPage(then: DefineStepFunction): void {
  then("I am returned to the landing page", async () => {
    expect(await screen.findByLabelText(/Filter by questionnaire name/i)).toBeDefined();
  });
}

export function thenReturnedToDetailsPage(then: DefineStepFunction): void {
  then("I am returned to the questionnaire details page", async () => {
    expect(await screen.findByText(/questionnaire details/i)).toBeDefined();
  });
}

export function thenNoDeleteOption(then: DefineStepFunction): void {
  then(
    /I will not have the option to 'delete' displayed for '(.*)'/,
    async (questionnaire: string) => {
      expect(
        screen.queryByRole("button", {
          name: new RegExp(`Delete questionnaire ${questionnaire}`, "i"),
        }),
      ).toBeNull();
    },
  );
}

export function thenLiveQuestionnaireWarning(then: DefineStepFunction): void {
  then("I am presented with a warning banner that I cannot overwrite the survey", async () => {
    expect(await screen.findByText(/you cannot overwrite questionnaire that are currently live/i));
  });
}

export function thenDeleteWarning(then: DefineStepFunction): void {
  then("I am presented with a warning", async () => {
    expect(
      await screen.findByText(/are you sure you want to delete the questionnaire/i),
    ).toBeDefined();
  });
}

export function thenActiveSurveyDaysWarning(then: DefineStepFunction): void {
  then("I am presented with a warning that questionnaire has active survey days", async () => {
    expect(await screen.findByText(/Questionnaire has active survey days/i)).toBeDefined();
  });
}

export function thenActiveWebCollectionWarning(then: DefineStepFunction): void {
  then(
    "I am presented with a warning that questionnaire is active for web collection",
    async () => {
      await act(async () => {
        await flushPromises();
      });

      expect(await screen.findByText(/Questionnaire is active for web collection/i)).toBeDefined();
    },
  );
}

export function thenConfirmOverwriteWarning(then: DefineStepFunction): void {
  then("I am presented with a warning, to confirm overwrite", async () => {
    expect(await screen.findByText(/are you sure you want to overwrite questionnaire/i));
  });
}

export function thenQuestionnaireDeleted(
  then: DefineStepFunction,
  mocker: MockAdapter,
): void {
  then(
    /the questionnaire and data is deleted from Blaise for '(.*)'/,
    async (questionnaire: string) => {
      await act(async () => {
        await flushPromises();
      });

      expect(mocker.history.delete).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            url: `/api/questionnaires/${questionnaire}`,
          }),
        ]),
      );
    },
  );
}

export function thenQuestionnaireNotDeleted(
  then: DefineStepFunction,
  mocker: MockAdapter,
): void {
  then(/the questionnaire and data is not deleted from Blaise for '(.*)'/, async () => {
    await act(async () => {
      await flushPromises();
    });

    expect(mocker.history.delete).toHaveLength(0);
  });
}

export function thenQuestionnaireInstalled(
  then: DefineStepFunction,
  mocker: MockAdapter,
): void {
  then(/the questionnaire package '(.*)' is deployed/, async (questionnaire: string) => {
    await act(async () => {
      await flushPromises();
    });

    expect(mocker.history.post).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "/api/install",
          data: JSON.stringify({ filename: `${questionnaire}.bpkg` }),
        }),
      ]),
    );
  });
}

export function thenQuestionnaireActivated(
  then: DefineStepFunction,
  mocker: MockAdapter,
): void {
  then(/the questionnaire package '(.*)' is activated/, async (questionnaire: string) => {
    await act(async () => {
      await flushPromises();
    });

    expect(mocker.history.patch).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: `/api/questionnaires/${questionnaire}/activate`,
        }),
      ]),
    );
  });
}

export function thenQuestionnaireDeactivated(
  then: DefineStepFunction,
  mocker: MockAdapter,
): void {
  then(/the questionnaire package '(.*)' is deactivated/, async (questionnaire: string) => {
    await act(async () => {
      await flushPromises();
    });

    expect(mocker.history.patch).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: `/api/questionnaires/${questionnaire}/deactivate`,
        }),
      ]),
    );
  });
}

export function thenDeleteSuccessBanner(then: DefineStepFunction): void {
  then(/I am presented a success banner on the launch page for deleting '(.*)'/, async () => {
    expect(await screen.findByText(/Filter by questionnaire name/i)).toBeDefined();
  });
}

export function thenDeployedListShown(then: DefineStepFunction): void {
  then(
    "I am presented with a list of the deployed questionnaires:",
    (table: Array<Record<string, string>>) => {
      expect(screen.getByText(/filter by questionnaire name/i)).toBeDefined();
      const list = screen.queryAllByTestId(/questionnaire-table-row/i);

      expect(list).toHaveLength(table.length);
      table.forEach((row, index: number) => {
        const rowData = list[index];

        if (rowData.firstChild === null) {
          expect(rowData.firstChild).not.toBeNull();

          return;
        }

        expect(rowData.firstChild.textContent?.trim()).toEqual(row.Questionnaire);
      });
    },
  );
}

export function thenChangeOrDeleteToStartDateOption(then: DefineStepFunction): void {
  then("I have the option to change or delete the Telephone Operations start date", async () => {
    expect(await screen.findByText(/Change or delete start date/i)).toBeDefined();
  });
}

export function thenAddToStartDateOption(then: DefineStepFunction): void {
  then("I have the option to add a Telephone Operations start date", async () => {
    expect(await screen.findByText(/Add start date/i)).toBeDefined();
  });
}

export function thenToStartDateShown(then: DefineStepFunction): void {
  then(/I can view the Telephone Operations start date is set to '(.*)'/, async (toStartDate: string) => {
    expect(await screen.findByText(new RegExp(toStartDate, "i"))).toBeDefined();
  });
}

export function thenToStartDateStored(then: DefineStepFunction, mocker: MockAdapter): void {
  then(
    /the Telephone Operations start date of '(.*)' is stored against '(.*)'/,
    async (toStartDate: string, questionnaire: string) => {
      expect(mocker.history.post).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            url: `/api/tostartdate/${questionnaire}`,
            data: JSON.stringify({ tostartdate: formatDateString(toStartDate) }),
          }),
        ]),
      );
    },
  );
}

export function thenTmReleaseDateStored(
  then: DefineStepFunction,
  mocker: MockAdapter,
): void {
  then(
    /the Totalmobile release date of '(.*)' is stored against '(.*)'/,
    async (tmReleaseDate: string, questionnaire: string) => {
      expect(mocker.history.post).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            url: `/api/tmreleasedate/${questionnaire}`,
            data: JSON.stringify({ tmreleasedate: formatDateString(tmReleaseDate) }),
          }),
        ]),
      );
    },
  );
}

export function thenToStartDateDeleted(then: DefineStepFunction, mocker: MockAdapter): void {
  then(/the Telephone Operations start date is deleted from '(.*)'/, async (questionnaire: string) => {
    expect(mocker.history.post).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: `/api/tostartdate/${questionnaire}`,
          data: JSON.stringify({ tostartdate: "" }),
        }),
      ]),
    );
  });
}

export function thenTmReleaseDateDeleted(
  then: DefineStepFunction,
  mocker: MockAdapter,
): void {
  then(/the Totalmobile release date is deleted from '(.*)'/, async (questionnaire: string) => {
    expect(mocker.history.post).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: `/api/tmreleasedate/${questionnaire}`,
          data: JSON.stringify({ tmreleasedate: "" }),
        }),
      ]),
    );
  });
}

export function thenUnableToDeleteWarning(then: DefineStepFunction): void {
  then(
    "I am presented with a warning banner that I cannot delete the questionnaire and a service desk must be raised",
    async () => {
      expect(
        await screen.findByRole("heading", { name: /Unable to delete questionnaire/i }),
      ).toBeDefined();
    },
  );
}

export function thenCannotDeleteQuestionnaire(then: DefineStepFunction): void {
  then("I am unable to delete the questionnaire", () => {
    expect(document.querySelector("#confirm-delete")).toBeNull();
    expect(screen.queryByRole("button", { name: /^Delete$/i })).toBeNull();
  });
}

export function thenCanReturnToList(then: DefineStepFunction): void {
  then("I can return to the questionnaire list", async () => {
    expect(screen.getByText(/View questionnaires/i)).toBeDefined();
    await userEvent.click(screen.getByText(/View questionnaires/i));
    expect(await screen.findByText(/Filter by questionnaire name/i)).toBeDefined();
  });
}

export function thenDeployErrorBanner(then: DefineStepFunction): void {
  then("I am presented with an information banner with an error message", async () => {
    expect(
      await screen.findByRole("heading", { name: /^Questionnaire .* deploy failed$/i }),
    ).toBeDefined();
  });
}

export function thenDeployErrorBannerWithMessage(then: DefineStepFunction): void {
  then(
    "I am presented with an information banner with an error message:",
    async (message: string) => {
      expect(
        await screen.findByRole("heading", { name: /^Questionnaire .* deploy failed$/i }),
      ).toBeDefined();
      expect(await screen.findByText(new RegExp(message.trim(), "i"))).toBeDefined();
    },
  );
}

export function thenCanRetryInstall(then: DefineStepFunction): void {
  then("I am able to return to the select survey package screen", async () => {
    await userEvent.click(await screen.findByText(/return to deploy questionnaire/i));
    expect(await screen.findByRole("heading", { name: /deploy questionnaire/i })).toBeDefined();
  });
}

export function thenGenerateUacAvailable(then: DefineStepFunction): void {
  then("A generate Unique Access Codes button is available", async () => {
    expect(
      await screen.findByRole(
        "button",
        { name: /Generate and download Unique Access Codes/i },
        { timeout: 5000 },
      ),
    ).toBeDefined();
  });
}

export function thenGenerateUacNotAvailable(then: DefineStepFunction): void {
  then("A generate Unique Access Codes button is not available", async () => {
    expect(
      screen.queryByRole("button", { name: /Generate and download Unique Access Codes/i }),
    ).toBeNull();
  });
}

export function thenUacsGenerated(then: DefineStepFunction, mocker: MockAdapter): void {
  then(/Unique Access Codes are generated for '(.*)'/, (questionnaireName: string) => {
    expect(mocker.history.post).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: `/api/uacs/instrument/${questionnaireName}`,
        }),
      ]),
    );
  });
}

export function thenUacError(then: DefineStepFunction): void {
  then("I receive an appropriate error describing suitable user actions", () => {
    expect(
      screen.getByText(/Error occurred while generating Unique Access Codes/i),
    ).toBeInTheDocument();
  });
}

export function thenCasesDisplayed(then: DefineStepFunction): void {
  then(/I can see that that the questionnaire has (\d+) cases/, async (cases: string) => {
    // Should appear twice as the number 500 should show for number of cases
    // as well as number of Unique Access Codes generated
    await waitFor(() => {
      expect(screen.getAllByText(cases)).toHaveLength(2);
    });
  });
}

export function thenDeploySuccessBanner(then: DefineStepFunction): void {
  then("I am presented with a successful deployment banner on the landing page", async () => {
    expect(
      await screen.findByRole("heading", { name: /^Questionnaire .* deployed$/i }),
    ).toBeDefined();
  });
}

export function thenCanOnlyReturnToLandingPage(then: DefineStepFunction): void {
  then("I can only return to the landing page", async () => {
    expect(await screen.findByText(/accept and go to table of questionnaires/i));
    await userEvent.click(await screen.findByText(/accept and go to table of questionnaires/i));
  });
}

export function thenQuestionnaireNotFound(then: DefineStepFunction): void {
  then(/I am presented with the following message: '(.*)'/, async (message: string) => {
    expect(await screen.findByText(/0\s+results/i)).toBeDefined();
    expect(await screen.findByText(new RegExp(message, "i"))).toBeDefined();
  });
}

export function thenToStartDatePrompt(then: DefineStepFunction): void {
  then("I am presented with an option to specify a Telephone Operations start date", async () => {
    expect(
      await screen.findByText(/Would you like to set a Telephone Operations start date/i),
    ).toBeDefined();
  });
}

export function thenSummaryHasNoToStartDate(then: DefineStepFunction): void {
  then("the questionnaire is deployed without a Telephone Operations start date", async () => {
    expect(await screen.findByText(/Deployment summary/i)).toBeDefined();
    expect(
      await screen.findAllByText((_, element) => {
        const text = (element?.textContent ?? "").replace(/\s+/g, " ").toLowerCase();

        return text.includes("start date") && text.includes("not specified");
      }),
    ).not.toHaveLength(0);
  });
}

export function thenDeployOption(then: DefineStepFunction): void {
  then("I am presented with an option to deploy a new questionnaire", async () => {
    expect(await screen.findByRole("link", { name: /^Deploy questionnaire$/i })).toBeDefined();
  });
}

export function thenDeployFileOption(
  then: DefineStepFunction,
): void {
  then("I am presented with an option to choose a file containing the questionnaire", async () => {
    expect(await screen.findByRole("heading", { name: /^Deploy questionnaire$/i })).toBeDefined();
  });
}

export function thenCanSelectPackage(then: DefineStepFunction): void {
  then(
    /I can select a questionnaire package for '(.*)' to install/,
    async (questionnaire: string) => {
      const input = await screen.findByLabelText(
        /Select questionnaire package|Select survey package/i,
      );

      const file = new File(["(⌐□_□)"], `${questionnaire}.bpkg`, { type: "application/zip" });

      await userEvent.upload(input, file);
    },
  );
}

export function thenUploadDisabled(then: DefineStepFunction): void {
  then(
    "I am unable to select another file or continue again until the deployment has finished",
    async () => {
      const fileInput = await screen.findByLabelText(
        /Select questionnaire package|Select survey package/i,
      );

      await waitFor(() => expect(fileInput).toBeDisabled());
      const continueButton = document.querySelector("#continue-deploy-button");

      expect(continueButton).not.toBeNull();
      await waitFor(() => expect(continueButton).toBeDisabled());
    },
  );
}

export function thenIncorrectSettingsWarning(then: DefineStepFunction): void {
  then("a warning is displayed with the message", async () => {
    expect(
      await screen.findAllByText((_, element) => {
        const text = (element?.textContent ?? "").replace(/\s+/g, " ").toLowerCase();

        return text.includes("does not match") && text.includes("recommended settings");
      }),
    ).not.toHaveLength(0);
  });
}

export function thenContinueOrCancelOption(then: DefineStepFunction): void {
  then("I get the option to continue loading or cancel the deployment", async () => {
    await waitFor(() => {
      const deployButton: Element | null = document.querySelector("#continue-deploy-button");

      expect(deployButton).not.toBeNull();
      expect(deployButton?.textContent).toEqual("Deploy anyway");
      const cancelButton: Element | null = document.querySelector("#cancel-deploy-button");

      expect(cancelButton).not.toBeNull();
      expect(cancelButton?.textContent).toEqual("Cancel");
    });
  });
}

export function thenTmReleaseDatePrompt(
  then: DefineStepFunction,
): void {
  then("I am presented with an option to specify a Totalmobile release date", async () => {
    expect(
      await screen.findByRole("heading", {
        name: /Would you like to set a Totalmobile release date/i,
      }),
    ).toBeDefined();
  });
}

export function thenDeploymentSummary(then: DefineStepFunction): void {
  then("I am given a summary of the deployment", async () => {
    expect(await screen.findByText(/Deployment summary/i)).toBeDefined();
    expect(await screen.findByText(/Questionnaire file name/i)).toBeDefined();
    expect(await screen.findByText(/Questionnaire file last modified date/i)).toBeDefined();
    expect(await screen.findByText(/Questionnaire file size/i)).toBeDefined();
  });
}

export function thenTmReleaseDateShown(then: DefineStepFunction): void {
  then(
    /I can view the Totalmobile release date is set to '(.*)'/,
    async (tmReleaseDate: string) => {
      expect(await screen.findByText(new RegExp(tmReleaseDate, "i"))).toBeDefined();
    },
  );
}

export function thenSummaryHasNoTmReleaseDate(then: DefineStepFunction): void {
  then("the questionnaire is deployed without a Totalmobile release date", async () => {
    expect(await screen.findByText(/Deployment summary/i)).toBeDefined();
    expect(await screen.findByText(/Totalmobile release date/i)).toBeDefined();
    const matches = screen.getAllByText((_, element) => {
      const text = element?.textContent ?? "";

      return text.includes("Not specified");
    });

    expect(matches.length).toBeGreaterThan(0);
  });
}

export function thenTmReleaseDateEntryShown(
  then: DefineStepFunction,
): void {
  then("I will see an entry displayed for Totalmobile release date", async () => {
    expect(await screen.findByText(/^Totalmobile release date$/i)).toBeDefined();
  });
}

export function thenChangeOrDeleteTmReleaseDateOption(
  then: DefineStepFunction,
): void {
  then("I have the option to change or delete the Totalmobile release date", async () => {
    expect(await screen.findByText(/Change or delete release date/i)).toBeDefined();
  });
}

export function thenAddTmReleaseDateOption(then: DefineStepFunction): void {
  then("I have the option to add a Totalmobile release date", async () => {
    expect(
      await screen.findByRole("link", { name: /^Add a release date for questionnaire /i }),
    ).toBeDefined();
  });
}
