
import React from "react";
import "@testing-library/jest-dom";
import { act, screen, render } from "@testing-library/react";
import flushPromises from "../../tests/utils";
import userEvent from "@testing-library/user-event";
import { DefineStepFunction } from "jest-cucumber";
import { Router } from "react-router";
import { createMemoryHistory } from "history";
import App from "../../App";
import { format_date_string } from "./helpers/functions";

export const whenIConfirmMySelection = (when: DefineStepFunction): void => {
  when("I confirm my selection", async () => {
    userEvent.click(screen.getByText(/Continue/));
    await act(async () => {
      await flushPromises();
    });
  });
};

export const whenISelectTo = (when: DefineStepFunction): void => {
  when(/I select to '(.*)'/, async (button: string) => {
    if (button == "cancel") {
      userEvent.click(screen.getByText("Cancel and keep original questionnaire"));
      userEvent.click(screen.getByText(/Continue/));
    }
  });
};

export const whenILoadTheHomepage = (when: DefineStepFunction): void => {
  when("I load the homepage", async () => {
    const history = createMemoryHistory();
    render(
      <Router history={history} >
        <App />
      </Router>
    );
    await act(async () => {
      await flushPromises();
    });
  });
};

export const whenIDeleteAQuestionnaire = (when: DefineStepFunction): void => {
  when(/I select a link to delete the '(.*)' questionnaire/, async (questionnaire: string) => {
    userEvent.click(screen.getByTestId(`delete-${questionnaire}`));
  });
};

export const whenIConfirmDelete = (when: DefineStepFunction): void => {
  when("I confirm that I want to proceed", async () => {
    userEvent.click(screen.getByTestId(/confirm-delete/i));
  });
};

export const whenICancelDelete = (when: DefineStepFunction): void => {
  when("I click cancel", async () => {
    userEvent.click(screen.getByTestId(/cancel-delete/i));
  });
};

export const whenISelectTheQuestionnaire = (when: DefineStepFunction): void => {
  when(/I select the questionnaire '(.*)'/, async (questionnaire: string) => {
    userEvent.click(screen.getByText(questionnaire));
  });
};

export const whenISelectToChangeOrDeleteTOStartDate = (when: DefineStepFunction): void => {
  when("I select to change or delete the TO Start Date", async () => {
    await act(async () => {
      await flushPromises();
    });
    userEvent.click(screen.getByText(/Change or delete start date/i));
  });
};

export const whenIHaveSelectedToAddAToStartDate = (when: DefineStepFunction): void => {
  when("I have slected to add a TO Start Date", async () => {
    await act(async () => {
      await flushPromises();
    });
    userEvent.click(screen.getByText(/Add start date/i));
  });
};

export const whenISpecifyAToStartDateOf = (when: DefineStepFunction): void => {
  when(/I specify the TO start date of '(.*)'/, async (toStartDate: string) => {
    userEvent.click(screen.getByText(/Yes, let me specify a start date/i));
    userEvent.type(screen.getByLabelText(/Please specify date/i), format_date_string(toStartDate));
    await act(async () => {
      await flushPromises();
    });
  });
};

export const whenIDeleteTheToStartDate = (when: DefineStepFunction): void => {
  when("I delete the TO start date", async () => {
    userEvent.click(screen.getByText(/No start date/i));
    await act(async () => {
      await flushPromises();
    });
  });
};

export const whenISelectTheContinueButton = (when: DefineStepFunction): void => {
  when("I select the continue button", async () => {
    await act(async () => {
      await flushPromises();
    });
    userEvent.click(screen.getByText(/continue/i));
    await act(async () => {
      await flushPromises();
    });
  });
};
