
import { screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DefineStepFunction } from "jest-cucumber";
import flushPromises from "../../tests/utils";
import { format_date_string } from "./helpers/functions";

export const thenIAmPresentedWithTheOptionsToCancelOrOverwrite = (then: DefineStepFunction): void => {
  then("I am presented with the options to cancel or overwrite the questionnaire", async () => {
    await waitFor((() => {
      expect(screen.getByText(/already exists in the system/i)).toBeDefined();
      expect(screen.getByText("Overwrite the entire questionnaire")).toBeDefined();
    }));
  });
};

export const thenIAmReturnedToTheLandingPage = (then: DefineStepFunction): void => {
  then("I am returned to the landing page", async () => {
    await waitFor((() => {
      expect(screen.getByText(/table of questionnaires/i)).toBeDefined();
    }));
  });
};

export const thenIWillNotHaveTheOptionToDelete = (then: DefineStepFunction): void => {
  then(/I will not have the option to 'delete' displayed for '(.*)'/, async (questionnaire: string) => {
    await waitFor(() => {
      const deleteButton: any = document.querySelector(`#delete-${questionnaire}`);
      expect(deleteButton).not.toBeNull();
      expect(deleteButton.textContent).toEqual("Questionnaire is live");
    });
  });
};


export const thenTheLandingScreenDisplaysAWarningThatLiveSurveysCannotBeDeleted = (then: DefineStepFunction): void => {
  then("the landing screen displays a warning that live surveys cannot be deleted", async () => {
    await waitFor(() => {
      expect(screen.getByText(/questionnaire requires deletion, raise a Service Desk ticket to complete this request/i)).toBeDefined();
    });
  });
};

export const thenIGetTheQuestionnaireIsLiveWarningBanner = (then: DefineStepFunction): void => {
  then("I am presented with a warning banner that I cannot overwrite the survey", async () => {
    await waitFor((() => {
      expect(screen.getByText(/you cannot overwrite questionnaire that are currently live/i));
    }));
  });
};

export const thenIAmPresentedWithAWarning = (then: DefineStepFunction): void => {
  then("I am presented with a warning", async () => {
    await waitFor((() => {
      expect(screen.getByText(/are you sure you want to delete the questionnaire/i)).toBeDefined();
    }));
  });
};

export const thenIAmPresentedWithAConfirmOverwriteWarning = (then: DefineStepFunction): void => {
  then("I am presented with a warning, to confirm overwrite", async () => {
    await waitFor((() => {
      expect(screen.getByText(/are you sure you want to overwrite the entire questionnaire/i));
    }));
  });
};

export const thenTheQuestionnaireDataIsDeleted = (then: DefineStepFunction): void => {
  then(/the questionnaire and data is deleted from Blaise for '(.*)'/, async (questionnaire: string) => {
    await act(async () => {
      await flushPromises();
    });

    expect(global.fetch).toHaveBeenCalledWith(`/api/instruments/${questionnaire}`, {
      "body": null,
      "method": "DELETE",
      "headers": { "Content-Type": "application/json" }
    });
  });
};

export const thenTheQuestionnaireDataIsNotDeleted = (then: DefineStepFunction): void => {
  then(/the questionnaire and data is not deleted from Blaise for '(.*)'/, async (questionnaire: string) => {
    await act(async () => {
      await flushPromises();
    });

    expect(global.fetch).not.toBeCalledWith(`/api/instruments/${questionnaire}`, {
      "body": null,
      "method": "DELETE"
    });
  });
};

export const thenTheQuestionnaireIsInstalled = (then: DefineStepFunction): void => {
  then(/the questionnaire package '(.*)' is deployed/, async (questionnaire: string) => {
    await act(async () => {
      await flushPromises();
    });

    expect(global.fetch).toHaveBeenCalledWith(`/api/install?filename=${questionnaire}.bpkg`, {
      "body": null,
      "method": "GET",
      "headers": { "Content-Type": "application/json" }
    });
  });
};

export const thenIGetTheDeleteSuccessBanner = (then: DefineStepFunction): void => {
  then(/I am presented a success banner on the launch page for deleting '(.*)'/, async (questionnaire: string) => {
    await waitFor(() => {
      expect(screen.getByText(new RegExp(`questionnaire: ${questionnaire} successfully deleted`, "i"))).toBeDefined();
    });
  });
};

export const thenIAmPresentedWithAListOfDeployedQuestionnaires = (then: DefineStepFunction): void => {
  then("I am presented with a list of the deployed questionnaires:", (table: any[]) => {
    expect(screen.getByText(/table of questionnaires/i)).toBeDefined();
    const list = screen.queryAllByTestId(/instrument-table-row/i);
    expect(list).toHaveLength(table.length);
    table.forEach((row: any, index: number) => {
      const rowData = list[index];
      if (rowData.firstChild === null) {
        expect(rowData.firstChild).not.toBeNull();
        return;
      }
      expect(rowData.firstChild.textContent).toEqual(row.Questionnaire);
    });
  });
};

export const thenIHaveTheOptionToChangeOrDeleteTheToStartDate = (then: DefineStepFunction): void => {
  then("I have the option to change or delete the TO Start date", async () => {
    await waitFor(() => {
      expect(screen.getByText(/Change or delete start date/i)).toBeDefined();
    });
  });
};

export const thenIHaveTheOptionToAddAToStartDate = (then: DefineStepFunction): void => {
  then("I have the option to add a TO Start date", async () => {
    await waitFor(() => {

      expect(screen.getByText(/Add start date/i)).toBeDefined();
    });
  });
};

export const thenICanViewTheTOStartDateSetToo = (then: DefineStepFunction): void => {
  then(/I can view the TO Start Date set too '(.*)'/, async (toStartDate: string) => {
    await waitFor(() => {
      expect(screen.getByText(new RegExp(toStartDate, "i"))).toBeDefined();
    });
  });
};

export const thenTheToStartDateIsStored = (then: DefineStepFunction): void => {
  then(/the TO start date of '(.*)' is stored against '(.*)'/, async (toStartDate: string, questionnaire: string) => {
    await waitFor(() => {
      expect(screen.getByText(/Questionnaire details/i)).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith(`/api/tostartdate/${questionnaire}`, {
        "body": JSON.stringify({ "tostartdate": format_date_string(toStartDate) }),
        "method": "POST",
        "headers": { "Content-Type": "application/json" }
      });
    });
  });
};

export const thenTheToStartDateIsDeleted = (then: DefineStepFunction): void => {
  then(/the TO Start Date is deleted from '(.*)'/, async (questionnaire: string) => {
    await waitFor(() => {
      expect(screen.getByText(/Questionnaire details/i)).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith(`/api/tostartdate/${questionnaire}`, {
        "body": JSON.stringify({ "tostartdate": "" }),
        "method": "POST",
        "headers": { "Content-Type": "application/json" }
      });
    });
  });
};

export const thenIAmPresentedWithAUnableDeleteWarning = (then: DefineStepFunction): void => {
  then("I am presented with a warning banner that I cannot delete the questionnaire and a service desk must be raised", () => {
    expect(screen.getByText(/Unable to delete questionnaire/i)).toBeDefined();
  });
};

export const thenIAmPresentedWithACannotDeleteWarning = (then: DefineStepFunction): void => {
  then("I am presented with a warning banner informing me that the questionnaire cannot be deleted", () => {
    expect(screen.getByText(/Failed to delete the questionnaire/i)).toBeDefined();
  });
};

export const thenIAmUnableToDeleteTheQuestionnaire = (then: DefineStepFunction): void => {
  then("I am unable to delete the questionnaire", () => {
    expect(screen.queryByTestId(/confirm-delete/i)).toBeNull();
  });
};

export const thenICanReturnToTheQuestionnaireList = (then: DefineStepFunction): void => {
  then("I can return to the questionnaire list", () => {
    expect(screen.getByText(/Return to table of questionnaires/i)).toBeDefined();
    userEvent.click(screen.getByText(/Return to table of questionnaires/i));
    expect(screen.getByText(/Table of questionnaires/i)).toBeDefined();
  });
};

export const thenIGetAnErrorBanner = (then: DefineStepFunction): void => {
  then("I am presented with an information banner with an error message", async () => {
    await waitFor(() => {
      expect(screen.getByText("File deploy failed")).toBeDefined();
    });
  });
};

export const thenICanRetryAnInstall = (then: DefineStepFunction): void => {
  then("I am able to return to the select survey package screen", async () => {
    userEvent.click(screen.getByText(/return to select survey package page/i));
    await waitFor(() => {
      expect(screen.getByText(/deploy a questionnaire file/i)).toBeDefined();
    });
  });
};

export const thenAGenerateUacButtonIsAvailable = (then: DefineStepFunction): void => {
  then("A generate UAC button is available", () => {
    expect(screen.getByText(/Generate and download Unique Access Codes/i)).toBeDefined();
  });
};

export const thenAGenerateUacButtonIsNotAvailable = (then: DefineStepFunction): void => {
  then("A generate UAC button is not available", async () => {
    await waitFor(() => {
      expect(screen.queryAllByText(/Generate and download Unique Access Codes/i)).toHaveLength(0);
    });
  });
};

export const thenUACsAreGenerated = (then: DefineStepFunction): void => {
  then(/UACs are generated for '(.*)'/, (questionnaire: string) => {
    expect(global.fetch).toHaveBeenCalledWith(`/api/uacs/instrument/${questionnaire}`, {
      "method": "POST",
      "body": null,
      "headers": { "Content-Type": "application/json" }
    });
  });
};

export const thenIReceiveAUACError = (then: DefineStepFunction): void => {
  then("I receive an appropriate error describing suitable user actions", () => {
    // In what world is this an appropriate error???
    expect(screen.getByText(/I receive an appropriate error describing suitable user actions/i)).toBeDefined();
  });
};

export const thenICanSeeThatThatTheQuestionnaireHasCases = (then: DefineStepFunction): void => {
  then(/I can see that that the questionnaire has (\d+) cases/, async (cases: string) => {
    await waitFor(() => {
      // Should appear twice as the number 500 should show for number of cases
      // as well as number of Unique Access Codes generated
      expect(screen.queryAllByText(cases)).toHaveLength(2);
    });
  });
};

export const thenIAmPresentedWithASuccessfullyDeployedBanner = (then: DefineStepFunction): void => {
  then("I am presented with a successful deployment banner on the landing page", async () => {
    await waitFor(() => {
      expect(screen.getByText(/The questionnaire file has been successfully deployed and will be displayed within the table of questionnaires./i)).toBeDefined();
    });
  });
};

export const thenICanOnlyReturnToTheLandingPage = (then: DefineStepFunction): void => {
  then("I can only return to the landing page", async () => {
    await waitFor((() => {
      expect(screen.getByText(/accept and go to table of questionnaires/i));
      userEvent.click(screen.getByText(/accept and go to table of questionnaires/i));
    }));
  });
};

export const thenIAmPresentedWithQuestionnaireNotFound = (then: DefineStepFunction): void => {
  then(/I am presented with the following message: '(.*)'/, async (message: string) => {
    await waitFor((() => {
      expect(screen.getByText(/0 results/i)).toBeDefined();
      expect(screen.getByText(new RegExp(message, "i"))).toBeDefined();
    }));
  });
};
