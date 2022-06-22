/**
 * @jest-environment jsdom
 */

import React from "react";
import "@testing-library/jest-dom";
import {act, screen, render} from "@testing-library/react";
import flushPromises from "../../tests/utils";
import userEvent from "@testing-library/user-event";
import {DefineStepFunction} from "jest-cucumber";
import {Router} from "react-router";
import {createMemoryHistory} from "history";
import App from "../../app";
import {formatDateString, navigatePastSettingTOStartDateAndDeployQuestionnaire} from "./helpers/functions";

export function whenIConfirmMySelection(when: DefineStepFunction): void {
    when("I confirm my selection", async () => {
        userEvent.click(screen.getByText(/Continue/));
        await act(async () => {
            await flushPromises();
        });
    });
}

export function whenIConfirmMySelectionNoWait(when: DefineStepFunction): void {
    when("I confirm my selection", () => {
        userEvent.click(screen.getByText(/Continue/));
    });
}

export function whenISelectTo(when: DefineStepFunction): void {
    when(/I select to '(.*)'/, async (button: string) => {
        if (button == "cancel") {
            userEvent.click(screen.getByText("Cancel and keep original questionnaire"));
            userEvent.click(screen.getByText(/Continue/));
        }
    });
}

export function whenILoadTheHomepage(when: DefineStepFunction): void {
    when("I load the homepage", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <App/>
            </Router>
        );
        await act(async () => {
            await flushPromises();
        });
    });
}

export function whenIGoToTheQuestionnaireDetailsPage(when: DefineStepFunction): void {
    when(/I go to the questionnaire details page for '(.*)'/, async (questionnaire: string) => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <App/>
            </Router>
        );
        await act(async () => {
            await flushPromises();
        });

        userEvent.click(screen.getByText(questionnaire));
        await act(async () => {
            await flushPromises();
        });
    });
}

export function whenIDeleteAQuestionnaire(when: DefineStepFunction): void {
    when(/I select a link to delete the '(.*)' questionnaire/, async (questionnaire: string) => {
        userEvent.click(screen.getByTestId(/delete-questionnaire/));
    });
}

export function whenIConfirmDelete(when: DefineStepFunction): void {
    when("I confirm that I want to proceed", async () => {
        userEvent.click(screen.getByTestId(/confirm-delete-button/i));
        await act(async () => {
            await flushPromises();
        });
    });
}

export function whenICancelDelete(when: DefineStepFunction): void {
    when("I click cancel", async () => {
        userEvent.click(screen.getByTestId(/cancel-delete-button/i));
        await act(async () => {
            await flushPromises();
        });
    });
}

export function whenISelectTheQuestionnaire(when: DefineStepFunction): void {
    when(/I select the questionnaire '(.*)'/, async (questionnaire: string) => {
        userEvent.click(screen.getByText(questionnaire));
    });
}

export function whenISelectToChangeOrDeleteTOStartDate(when: DefineStepFunction): void {
    when("I select to change or delete the TO Start Date", async () => {
        await act(async () => {
            await flushPromises();
        });
        userEvent.click(screen.getByText(/Change or delete start date/i));
    });
}

export function whenIHaveSelectedToAddAToStartDate(when: DefineStepFunction): void {
    when("I have slected to add a TO Start Date", async () => {
        await act(async () => {
            await flushPromises();
        });
        userEvent.click(screen.getByText(/Add start date/i));
    });
}

export function whenISpecifyATOStartDateOf(when: DefineStepFunction): void {
    when(/I specify the TO start date of '(.*)'/, async (toStartDate: string) => {
        userEvent.click(screen.getByText(/Yes, let me specify a start date/i));
        userEvent.type(screen.getByLabelText(/Please specify date/i), formatDateString(toStartDate));
        await act(async () => {
            await flushPromises();
        });
    });
}

export function whenIDeleteTheToStartDate(when: DefineStepFunction): void {
    when("I delete the TO start date", async () => {
        userEvent.click(screen.getByText(/No start date/i));
        await act(async () => {
            await flushPromises();
        });
    });
}

export function whenISelectToInstallWithNoStartDate(when: DefineStepFunction): void {
    when("I select to not provide a TO Start Date", async () => {
        userEvent.click(screen.getByText(/No start date/i));
        userEvent.click(screen.getByText(/Continue/));
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
        userEvent.click(screen.getByText(/continue/i));
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
        userEvent.click(screen.getByText(/Generate and download Unique Access Codes/i));
        await act(async () => {
            await flushPromises();
        });
    });
}

export function whenISelectToOverwrite(when: DefineStepFunction): void {
    when("I select to 'overwrite'", async () => {
        userEvent.click(screen.getByText(/overwrite the entire questionnaire/i));
        userEvent.click(screen.getByText(/Continue/));
        await act(async () => {
            await flushPromises();
        });
    });
}

export function whenIConfirmToOverwrite(when: DefineStepFunction): void {
    when("I confirm 'overwrite'", async () => {
        userEvent.click(screen.getByText(/yes, overwrite questionnaire/i));
        userEvent.click(screen.getByText(/Continue/));
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
        userEvent.click(screen.getByText(/no, do not overwrite questionnaire/i));
        userEvent.click(screen.getByText(/Continue/));
    });
}

export function whenISearchForAQuestionnaire(when: DefineStepFunction): void {
    when(/I enter the '(.*)' in the search box/, async (questionnaire: string) => {
        userEvent.type(screen.getByLabelText(/Filter by questionnaire name/i), questionnaire);
        await act(async () => {
            await flushPromises();
        });
    });
}

export function whenIDeployTheQuestionnaire(when: DefineStepFunction): void {
    when("I deploy the questionnaire", async () => {
        userEvent.click(screen.getByText(/Deploy questionnaire/));

        await act(async () => {
            await flushPromises();
        });
    });
}

export function whenIClickDeployNewQuestionnaire(when: DefineStepFunction): void {
    when("I click deploy a questionnaire", async () => {
        await act(async () => {
            await flushPromises();
        });
        userEvent.click(screen.getByText(/Deploy a questionnaire/i));
        await act(async () => {
            await flushPromises();
        });
    });
}

export function whenIHaveSelectedADeployPackage(then: DefineStepFunction): void {
    then(/I have selected a deploy package for '(.*)'/, async (questionnaire: string) => {
        const input = screen.getByLabelText(/Select survey package/i);

        const file = new File(["(⌐□_□)"], `${questionnaire}.bpkg`, {type: "application/zip"});

        userEvent.upload(input, file);
    });
}

export function whenIChooseToDeployAnyway(when: DefineStepFunction): void {
    when("I choose to deploy anyway", async () => {
        userEvent.click(await screen.getByRole("button", {name: /Deploy anyway/i}));
        await act(async () => {
            await flushPromises();
        });
    });
}

export function whenIChooseToCancel(when: DefineStepFunction): void {
    when("I choose to cancel", async () => {
        userEvent.click(await screen.getByRole("button", {name: /Cancel/i}));
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
        userEvent.click(screen.getByText(/No start date/i));
        userEvent.click(screen.getByText(/Continue/));

        await act(async () => {
            await flushPromises();
        });

        userEvent.click(screen.getByText(/Deploy questionnaire/));

        await act(async () => {
            await flushPromises();
        });
    });
}

// export function whenIViewTheQuestionnaireDetailsPageForThatQuestionnaireInDQS(when: DefineStepFunction): void {
//     when(/I view the questionnaire details page for questionnaire '(.*)' in DQS/, async (questionnaire: string) => {
//         const history = createMemoryHistory();
//         render(
//             <Router history={history}>
//                 <App/>
//             </Router>
//         );
//         await act(async () => {
//             await flushPromises();
//         });
//
//         userEvent.click(screen.getByText(questionnaire));
//         await act(async () => {
//             await flushPromises();
//         });
//     });
// }

export function whenISpecifyATMReleaseDateOf(when: DefineStepFunction): void {
    when(/I specify the TM release date of '(.*)'/, async (toStartDate: string) => {
        userEvent.click(screen.getByText(/Yes, let me specify a release date/i));
        userEvent.type(screen.getByLabelText(/Please specify date/i), formatDateString(toStartDate));
        await act(async () => {
            await flushPromises();
        });
    });
}

export function whenISelectToInstallWithNoTMReleaseDate(when: DefineStepFunction): void {
    when("I select to not provide a TM Release Date", async () => {
        userEvent.click(screen.getByText(/No release date/i));
        userEvent.click(screen.getByText(/Continue/));
        await act(async () => {
            await flushPromises();
        });
    });
}

export function whenISelectToChangeOrDeleteTMReleaseDate(when: DefineStepFunction): void {
    when("I select to change or delete the Totalmobile release date", async () => {
        await act(async () => {
            await flushPromises();
        });
        userEvent.click(screen.getByText(/Change or delete release date/i));
    });
}

export function whenIDoNotSelectANewDate(when: DefineStepFunction): void {
    when("I do not select a new date", async () => {
        expect(true)
    });
}

export function whenIDoNotRemoveThePreSelectedDate(when: DefineStepFunction): void {
    when("I do not remove the pre selected date", async () => {
        expect(true)
    });
}
