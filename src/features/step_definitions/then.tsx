
import { screen, waitFor, act } from "@testing-library/react";
import { DefineStepFunction } from "jest-cucumber";
import flushPromises from "../../tests/utils";

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

export const thenIAmPresentedWithAWarning = (then: DefineStepFunction): void => {
  then("I am presented with a warning", async () => {
    await waitFor((() => {
      expect(screen.getByText(/are you sure you want to delete the questionnaire/i)).toBeDefined();
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

export const thenIGetTheDeleteSuccessBanner = (then: DefineStepFunction): void => {
  then(/I am presented a success banner on the launch page for deleting '(.*)'/, async (questionnaire: string) => {
    await waitFor(() => {
      expect(screen.getByText(new RegExp(`questionnaire: ${questionnaire} successfully deleted`, "i"))).toBeDefined();
    });
  });
};
