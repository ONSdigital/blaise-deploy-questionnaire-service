
import React from "react";
import "@testing-library/jest-dom";
import { act, screen, render } from "@testing-library/react";
import flushPromises from "../../tests/utils";
import userEvent from "@testing-library/user-event";
import { DefineStepFunction } from "jest-cucumber";
import { Router } from "react-router";
import { createMemoryHistory } from "history";
import App from "../../App";

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
