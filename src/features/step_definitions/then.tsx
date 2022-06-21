/**
 * @jest-environment jsdom
 */

import { screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter/types";
import { DefineStepFunction } from "jest-cucumber";
import flushPromises from "../../tests/utils";
import { formatDateString } from "./helpers/functions";

export function thenIAmPresentedWithTheOptionsToCancelOrOverwrite(then: DefineStepFunction): void {
  then("I am presented with the options to cancel or overwrite the questionnaire", async () => {
    expect(await screen.findByText(/already exists in the system/i)).toBeDefined();
    expect(await screen.findByText("Overwrite the entire questionnaire")).toBeDefined();
  });
}

export function thenIAmReturnedToTheLandingPage(then: DefineStepFunction): void {
  then("I am returned to the landing page", async () => {
    expect(await screen.findByText(/Filter by questionnaire name/i)).toBeDefined();
  });
}

export function thenIAmReturnedToTheQuestionnaireDetailsPage(then: DefineStepFunction): void {
  then("I am returned to the questionnaire details page", async () => {
    expect(await screen.findByText(/questionnaire details/i)).toBeDefined();
  });
}

export function thenIWillNotHaveTheOptionToDelete(then: DefineStepFunction): void {
  then(/I will not have the option to 'delete' displayed for '(.*)'/, async (questionnaire: string) => {
      const deleteButton: any = document.querySelector(`#delete-${questionnaire}`);
      expect(await deleteButton).toBeNull();
  });
}

export function thenIGetTheQuestionnaireIsLiveWarningBanner(then: DefineStepFunction): void {
  then("I am presented with a warning banner that I cannot overwrite the survey", async () => {
    expect(await screen.findByText(/you cannot overwrite questionnaire that are currently live/i));
  });
}

export function thenIAmPresentedWithAWarning(then: DefineStepFunction): void {
  then("I am presented with a warning", async () => {
    expect(await screen.findByText(/are you sure you want to delete the questionnaire/i)).toBeDefined();
  });
}

export function thenIAmPresentedWithAnActiveSurveyDaysWarning(then: DefineStepFunction): void {
  then("I am presented with a warning that questionnaire has active survey days", async () => {
    expect(await screen.findByText(/Questionnaire has active Telephone Operations survey days/i)).toBeDefined();
  });
}

export function thenIAmPresentedWithAnActiveWebCollectionWarning(then: DefineStepFunction): void {
  then("I am presented with a warning that questionnaire is active for web collection", async () => {
    await act(async () => {
      await flushPromises();
    });

    expect(await screen.findByText(/Questionnaire is active for web collection/i)).toBeDefined();
  });
}

export function thenIAmPresentedWithAConfirmOverwriteWarning(then: DefineStepFunction): void {
  then("I am presented with a warning, to confirm overwrite", async () => {
    expect(await screen.findByText(/are you sure you want to overwrite the entire questionnaire/i));
  });
}

export function thenTheQuestionnaireDataIsDeleted(then: DefineStepFunction, mocker: MockAdapter): void {
  then(/the questionnaire and data is deleted from Blaise for '(.*)'/, async (questionnaire: string) => {
    await act(async () => {
      await flushPromises();
    });

    expect(mocker.history.delete).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: `/api/questionnaires/${questionnaire}`
        })
      ])
    );
  });
}

export function thenTheQuestionnaireDataIsNotDeleted(then: DefineStepFunction, mocker: MockAdapter): void {
  then(/the questionnaire and data is not deleted from Blaise for '(.*)'/, async (questionnaire: string) => {
    await act(async () => {
      await flushPromises();
    });

    expect(mocker.history.delete).toHaveLength(0);
  });
}

export function thenTheQuestionnaireIsInstalled(then: DefineStepFunction, mocker: MockAdapter): void {
  then(/the questionnaire package '(.*)' is deployed/, async (questionnaire: string) => {
    await act(async () => {
      await flushPromises();
    });

    expect(mocker.history.post).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "/api/install",
          data: JSON.stringify({ filename: `${questionnaire}.bpkg` })
        }),
      ])
    );
  });
}

export function thenTheQuestionnaireIsActivated(then: DefineStepFunction, mocker: MockAdapter): void {
  then(/the questionnaire package '(.*)' is activated/, async (questionnaire: string) => {
    await act(async () => {
      await flushPromises();
    });

    expect(mocker.history.patch).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: `/api/questionnaires/${questionnaire}/activate`,
        }),
      ])
    );
  });
}

export function thenTheQuestionnaireIsDeactivated(then: DefineStepFunction, mocker: MockAdapter): void {
  then(/the questionnaire package '(.*)' is deactivated/, async (questionnaire: string) => {
    await act(async () => {
      await flushPromises();
    });

    expect(mocker.history.patch).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: `/api/questionnaires/${questionnaire}/deactivate`,
        }),
      ])
    );
  });
}

export function thenIGetTheDeleteSuccessBanner(then: DefineStepFunction): void {
  then(/I am presented a success banner on the launch page for deleting '(.*)'/, async (questionnaire: string) => {
    expect(await screen.findByText(new RegExp(`questionnaire: ${questionnaire} successfully deleted`, "i"))).toBeDefined();
  });
}

export function thenIAmPresentedWithAListOfDeployedQuestionnaires(then: DefineStepFunction): void {
  then("I am presented with a list of the deployed questionnaires:", (table: any[]) => {
    expect(screen.getByText(/filter by questionnaire name/i)).toBeDefined();
    const list = screen.queryAllByTestId(/questionnaire-table-row/i);
    expect(list).toHaveLength(table.length);
    table.forEach((row: any, index: number) => {
      const rowData = list[index];
      if (rowData.firstChild === null) {
        expect(rowData.firstChild).not.toBeNull();
        return;
      }
      expect(rowData.firstChild.textContent?.trim()).toEqual(row.Questionnaire);
    });
  });
}

export function thenIHaveTheOptionToChangeOrDeleteTheToStartDate(then: DefineStepFunction): void {
  then("I have the option to change or delete the TO Start date", async () => {
    expect(await screen.findByText(/Change or delete start date/i)).toBeDefined();
  });
}

export function thenIHaveTheOptionToAddAToStartDate(then: DefineStepFunction): void {
  then("I have the option to add a TO Start date", async () => {
    expect(await screen.findByText(/Add start date/i)).toBeDefined();
  });
}

export function thenICanViewTheTOStartDateIsSetTo(then: DefineStepFunction): void {
  then(/I can view the TO Start Date is set to '(.*)'/, async (toStartDate: string) => {
    expect(await screen.findByText(new RegExp(toStartDate, "i"))).toBeDefined();
  });
}

export function thenTheToStartDateIsStored(then: DefineStepFunction, mocker: MockAdapter): void {
  then(/the TO start date of '(.*)' is stored against '(.*)'/, async (toStartDate: string, questionnaire: string) => {
    expect(mocker.history.post).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: `/api/tostartdate/${questionnaire}`,
          data: JSON.stringify({ "tostartdate": formatDateString(toStartDate) })
        }),
      ])
    );
  });
}

export function thenTheToStartDateIsDeleted(then: DefineStepFunction, mocker: MockAdapter): void {
  then(/the TO Start Date is deleted from '(.*)'/, async (questionnaire: string) => {
    expect(mocker.history.post).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: `/api/tostartdate/${questionnaire}`,
          data: JSON.stringify({ "tostartdate": "" })
        }),
      ])
    );
  });
}

export function thenIAmPresentedWithAUnableDeleteWarning(then: DefineStepFunction): void {
  then("I am presented with a warning banner that I cannot delete the questionnaire and a service desk must be raised", () => {
    expect(screen.getByText(/Unable to delete questionnaire/i)).toBeDefined();
  });
}

export function thenIAmPresentedWithACannotDeleteWarning(then: DefineStepFunction): void {
  then("I am presented with a warning banner informing me that the questionnaire cannot be deleted", () => {
    expect(screen.getByText(/Failed to delete the questionnaire/i)).toBeDefined();
  });
}

export function thenIAmUnableToDeleteTheQuestionnaire(then: DefineStepFunction): void {
  then("I am unable to delete the questionnaire", () => {
    expect(screen.queryByTestId(/confirm-delete/i)).toBeNull();
  });
}

export function thenICanReturnToTheQuestionnaireList(then: DefineStepFunction): void {
  then("I can return to the questionnaire list", async () => {
    expect(screen.getByText(/Return to table of questionnaires/i)).toBeDefined();
    userEvent.click(screen.getByText(/Return to table of questionnaires/i));
    await act(async () => {
      await flushPromises();
    });
    expect(screen.getByText(/Filter by questionnaire name/i)).toBeDefined();
  });
}

export function thenIGetAnErrorBanner(then: DefineStepFunction): void {
  then("I am presented with an information banner with an error message", async () => {
    expect(await screen.findByText("File deploy failed")).toBeDefined();
  });
}

export function thenIGetAnErrorBannerWithMessage(then: DefineStepFunction): void {
  then("I am presented with an information banner with an error message:", async (message: string) => {
    expect(await screen.findByText("File deploy failed")).toBeDefined();
    expect(await screen.findByText(new RegExp(message, "i"))).toBeDefined();
  });
}

export function thenICanRetryAnInstall(then: DefineStepFunction): void {
  then("I am able to return to the select survey package screen", async () => {
    userEvent.click(screen.getByText(/return to select survey package page/i));
    expect(await screen.findByText(/deploy a questionnaire file/i)).toBeDefined();
  });
}

export function thenAGenerateUacButtonIsAvailable(then: DefineStepFunction): void {
  then("A generate UAC button is available", () => {
    expect(screen.getByText(/Generate and download Unique Access Codes/i)).toBeDefined();
  });
}

export function thenAGenerateUacButtonIsNotAvailable(then: DefineStepFunction): void {
  then("A generate UAC button is not available", async () => {
    expect(await screen.queryAllByText(/Generate and download Unique Access Codes/i)).toHaveLength(0);
  });
}

export function thenUACsAreGenerated(then: DefineStepFunction, mocker: MockAdapter): void {
  then(/UACs are generated for '(.*)'/, (questionnaireName: string) => {
    expect(mocker.history.post).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: `/api/uacs/instrument/${questionnaireName}`,
        }),
      ])
    );
  });
}

export function thenIReceiveAUACError(then: DefineStepFunction): void {
  then("I receive an appropriate error describing suitable user actions", () => {
    expect(screen.getByText(/Error occurred while generating Unique Access Codes/i)).toBeInTheDocument();
  });
}

export function thenICanSeeThatThatTheQuestionnaireHasCases(then: DefineStepFunction): void {
  then(/I can see that that the questionnaire has (\d+) cases/, async (cases: string) => {
    // Should appear twice as the number 500 should show for number of cases
    // as well as number of Unique Access Codes generated
    expect(await screen.findAllByText(cases)).toHaveLength(2);
  });
}

export function thenIAmPresentedWithASuccessfullyDeployedBanner(then: DefineStepFunction): void {
  then("I am presented with a successful deployment banner on the landing page", async () => {
    expect(await screen.findByText(/The questionnaire file has been successfully deployed and will be displayed within the table of questionnaires./i)).toBeDefined();
  });
}

export function thenICanOnlyReturnToTheLandingPage(then: DefineStepFunction): void {
  then("I can only return to the landing page", async () => {
    expect(await screen.findByText(/accept and go to table of questionnaires/i));
    userEvent.click(await screen.findByText(/accept and go to table of questionnaires/i));
  });
}

export function thenIAmPresentedWithQuestionnaireNotFound(then: DefineStepFunction): void {
  then(/I am presented with the following message: '(.*)'/, async (message: string) => {
    expect(await screen.findByText(/0 results/i)).toBeDefined();
    expect(await screen.findByText(new RegExp(message, "i"))).toBeDefined();
  });
}

export function thenIAmPresentedWithAnOptionToSpecifyATOStartDate(then: DefineStepFunction): void {
  then("I am presented with an option to specify a TO Start Date", async () => {
    expect(await screen.findByText(/Would you like to set a telephone operations start date/i)).toBeDefined();
  });
}

export function thenTheSummaryPageHasNoTOStartDate(then: DefineStepFunction): void {
  then("the questionnaire is deployed without a TO Start Date", async () => {
    expect(await screen.findByText(/Deployment summary/i)).toBeDefined();
    expect(await screen.findByText(/Start date not specified/i)).toBeDefined();
  });
}

export function thenIAmPresentedWithAnOptionToDeployAQuestionnaire(then: DefineStepFunction): void {
  then("I am presented with an option to deploy a new questionnaire", async () => {
    expect(await screen.findByText(/Deploy a questionnaire/i)).toBeDefined();
  });
}

export function thenIAmPresentedWithAnOptionToDeployAQuestionnaireFile(then: DefineStepFunction): void {
  then("I am presented with an option to choose a file containing the questionnaire", async () => {
    expect(await screen.findByText(/Deploy a questionnaire file/i)).toBeDefined();
  });
}

export function thenICanSelectAQuestionnairePackageToInstall(then: DefineStepFunction): void {
  then(/I can select a questionnaire package for '(.*)' to install/, async (questionnaire: string) => {
    const input = screen.getByLabelText(/Select survey package/i);

    const file = new File(["(⌐□_□)"], `${questionnaire}.bpkg`, { type: "application/zip" });

    userEvent.upload(input, file);
  });
}

export function thenUploadIsDisabled(then: DefineStepFunction): void {
  then("I am unable to select another file or continue again until the deployment has finished", () => {
    expect(screen.getByLabelText(/Select survey package/i).closest("input")).toBeDisabled();
    expect(screen.getByTestId("button")).toBeDisabled();
  });
}

export function thenAWarningIsDisplayedWithTheMessage(then: DefineStepFunction): void {
  then("a warning is displayed with the message", async (message: string) => {
    message = message.replace(/\s/g, " ");
    expect(await screen.findByText(message, { exact: false })).toBeDefined();
  });
}

export function thenIGetTheOptionToContinueOrCancel(then: DefineStepFunction): void {
  then("I get the option to continue loading or cancel the deployment", async () => {
    await waitFor(() => {
      const deployButton: any = document.querySelector("#continue-deploy-button");
      expect(deployButton).not.toBeNull();
      expect(deployButton.textContent).toEqual("Deploy anyway");
      const cancelButton: any = document.querySelector("#cancel-deploy-button");
      expect(cancelButton).not.toBeNull();
      expect(cancelButton.textContent).toEqual("Cancel");
    });
  });
}

export function thenIAmPresentedWithAnOptionToSpecifyATMReleaseDate(then: DefineStepFunction): void {
  then("I am presented with an option to specify a Totalmobile release date", async () => {
    expect(await screen.findByText(/Would you like to set a Totalmobile release date/i)).toBeDefined();
  });
}

export function thenIAmGivenASummaryOfTheDeployment(then: DefineStepFunction): void {
  then("I am given a summary of the deployment", async () => {
    expect(await screen.findByText(/Deployment summary/i)).toBeDefined();
    expect(await screen.findByText(/Questionnaire file name/i)).toBeDefined();
    expect(await screen.findByText(/Questionnaire file last modified date/i)).toBeDefined();
    expect(await screen.findByText(/Questionnaire file size/i)).toBeDefined();
  });
}

export function thenICanViewTheTMReleaseDateIsSetTo(then: DefineStepFunction): void {
  then(/I can view the TM Release Date is set to '(.*)'/, async (tmReleaseDate: string) => {
    expect(await screen.findByText(new RegExp(tmReleaseDate, "i"))).toBeDefined();
  });
}

export function thenTheSummaryPageHasNoTMReleaseDate(then: DefineStepFunction): void {
  then("the questionnaire is deployed without a TM Release Date", async () => {
    expect(await screen.findByText(/Deployment summary/i)).toBeDefined();
    expect(await screen.findByText(/Release date not specified/i)).toBeDefined();
  });
}

export function thenIWillSeeAnEntryDisplayedForTotalmobileReleaseDate(then: DefineStepFunction): void {
  then("I will see an entry displayed for Totalmobile release date", async () => {
    await waitFor((() => {
      expect(screen.getByText(/Totalmobile release date/i)).toBeDefined();
    }));
  });
}

export function thenIHaveTheOptionToChangeOrDeleteTheTotalmobileReleaseDate(then: DefineStepFunction): void {
  then("I have the option to change or delete the Totalmobile release date", async () => {
    await waitFor(() => {
      expect(screen.getByText(/Change or delete release date/i)).toBeDefined();
    });
  });
}

export function thenIHaveTheOptionToAddATotalmobileReleaseDate(then: DefineStepFunction): void {
  then("I have the option to add a Totalmobile release date", async () => {
    await waitFor(() => {
      expect(screen.getByText(/Add release date/i)).toBeDefined();
    });
  });
}
