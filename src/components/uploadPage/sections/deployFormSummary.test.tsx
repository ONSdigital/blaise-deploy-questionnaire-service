/**
 * @jest-environment jsdom
 */

import {render} from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import '@testing-library/jest-dom/extend-expect';

const mock = new MockAdapter(axios);

import { AuthManager } from "blaise-login-react-client";
import React from "react";
import AskToSetTMReleaseDate from "./askToSetTMReleaseDate";
import { Formik } from "formik";
import DeployFormSummary from "./deployFormSummary";
import {questionnaireWithName} from "../../../features/step_definitions/helpers/apiMockObjects";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

describe("Deploy form summary page", () => {
    const lmsQuestionnaireName = "LMS2004A"
    const opnQuestionnaireName = "OPN2004A"

    const lmsFile = new File(["龴ↀ◡ↀ龴"], `${lmsQuestionnaireName}.bpkg`, { type: "application/pdf" });
    const opnFile = new File(["(♥_♥)"], `${opnQuestionnaireName}.bpkg`, { type: "application/pdf" });

    const lmsQuestionnaire = questionnaireWithName(lmsQuestionnaireName);
    const opnQuestionnaire = questionnaireWithName(opnQuestionnaireName);

    it("should match the Snapshot", async () => {
        const wrapper = render(
            <Formik initialValues={{ }} onSubmit={( ) => { }} >
                <DeployFormSummary  file={lmsFile} foundQuestionnaire={lmsQuestionnaire}/>
            </Formik>
        );

        expect(wrapper).toMatchSnapshot();
    });

    it("should display the questionnaire file name", async () => {
        const { getByText } = render(
            <Formik initialValues={{ }} onSubmit={( ) => { }} >
                <DeployFormSummary  file={lmsFile} foundQuestionnaire={lmsQuestionnaire}/>
            </Formik>
        );

        expect(getByText(/Questionnaire file name/i)).toBeDefined();
    });

    it("should display when the file was last modified", async () => {
        const { getByText } = render(
            <Formik initialValues={{ }} onSubmit={( ) => { }} >
                <DeployFormSummary  file={lmsFile} foundQuestionnaire={lmsQuestionnaire}/>
            </Formik>
        );

        expect(getByText(/Questionnaire file last modified date/i)).toBeDefined();
    });

    it("should display the questionnaire file size", async () => {
        const { getByText } = render(
            <Formik initialValues={{ }} onSubmit={( ) => { }} >
                <DeployFormSummary  file={lmsFile} foundQuestionnaire={lmsQuestionnaire}/>
            </Formik>
        );

        expect(getByText(/Questionnaire file size/i)).toBeDefined();
    });

    it("should display if the questionnaire exists in Blaise", async () => {
        const { getByText } = render(
            <Formik initialValues={{ }} onSubmit={( ) => { }} >
                <DeployFormSummary  file={lmsFile} foundQuestionnaire={lmsQuestionnaire}/>
            </Formik>
        );

        expect(getByText(/Does the questionnaire already exist in blaise?/i)).toBeDefined();
    });

    it("should display the telephone operation start date", async () => {
        const { getByText } = render(
            <Formik initialValues={{ }} onSubmit={( ) => { }} >
                <DeployFormSummary  file={lmsFile} foundQuestionnaire={lmsQuestionnaire}/>
            </Formik>
        );

        expect(getByText(/Set a telephone operations start date for questionnaire?/i)).toBeDefined();
    });

    it("should display the totalmobile release date for LMS questionnaires", async () => {
        const { getByText } = render(
            <Formik initialValues={{ }} onSubmit={( ) => { }} >
                <DeployFormSummary  file={lmsFile} foundQuestionnaire={lmsQuestionnaire}/>
            </Formik>
        );

        expect(getByText(/Set a totalmobile release date for questionnaire?/i)).toBeDefined();
    });

    it("should not display the totalmobile release date for non-LMS questionnaires", async () => {
        const { queryByText } = render(
            <Formik initialValues={{ }} onSubmit={( ) => { }} >
                <DeployFormSummary  file={opnFile} foundQuestionnaire={opnQuestionnaire}/>
            </Formik>
        );

        expect(queryByText(/Set a totalmobile release date for questionnaire?/i)).not.toBeInTheDocument();
    });
});
