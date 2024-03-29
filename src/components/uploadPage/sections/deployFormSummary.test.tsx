/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import React from "react";
import { Formik } from "formik";
import DeployFormSummary from "./deployFormSummary";
import { questionnaireWithName } from "../../../features/step_definitions/helpers/apiMockObjects";

// mock login
jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;
MockAuthenticate.OverrideReturnValues(null, true);

describe("Deploy form summary page", () => {
    const lmsQuestionnaireName = "LMS2004A";
    const opnQuestionnaireName = "OPN2004A";
    const lastModified = new Date("2022-01-24T01:02:03").getTime();

    const lmsFile = new File(["龴ↀ◡ↀ龴"], `${lmsQuestionnaireName}.bpkg`, {
        type: "application/pdf", lastModified: lastModified
    });
    const opnFile = new File(["(♥_♥)"], `${opnQuestionnaireName}.bpkg`, {
        type: "application/pdf", lastModified: lastModified
    });

    const lmsQuestionnaire = questionnaireWithName(lmsQuestionnaireName);
    const opnQuestionnaire = questionnaireWithName(opnQuestionnaireName);

    it("should match the Snapshot", async () => {
        const wrapper = render(
            <Formik initialValues={{}} onSubmit={() => {
            }}>
                <DeployFormSummary file={lmsFile} foundQuestionnaire={lmsQuestionnaire} />
            </Formik>
        );

        expect(wrapper).toMatchSnapshot();
    });

    it("should display the questionnaire file name", async () => {
        const { getByText } = render(
            <Formik initialValues={{}} onSubmit={() => {
            }}>
                <DeployFormSummary file={lmsFile} foundQuestionnaire={lmsQuestionnaire} />
            </Formik>
        );

        expect(getByText(/Questionnaire file name/i)).toBeInTheDocument();
    });

    it("should display when the file was last modified", async () => {
        const { getByText } = render(
            <Formik initialValues={{}} onSubmit={() => {
            }}>
                <DeployFormSummary file={lmsFile} foundQuestionnaire={lmsQuestionnaire} />
            </Formik>
        );

        expect(getByText(/Questionnaire file last modified date/i)).toBeInTheDocument();
    });

    it("should display the questionnaire file size", async () => {
        const { getByText } = render(
            <Formik initialValues={{}} onSubmit={() => {
            }}>
                <DeployFormSummary file={lmsFile} foundQuestionnaire={lmsQuestionnaire} />
            </Formik>
        );

        expect(getByText(/Questionnaire file size/i)).toBeInTheDocument();
    });

    it("should display if the questionnaire exists in Blaise", async () => {
        const { getByText } = render(
            <Formik initialValues={{}} onSubmit={() => {
            }}>
                <DeployFormSummary file={lmsFile} foundQuestionnaire={lmsQuestionnaire} />
            </Formik>
        );

        expect(getByText(/Does the questionnaire already exist in blaise?/i)).toBeInTheDocument();
    });

    it("should display the telephone operation start date", async () => {
        const { getByText } = render(
            <Formik initialValues={{}} onSubmit={() => {
            }}>
                <DeployFormSummary file={lmsFile} foundQuestionnaire={lmsQuestionnaire} />
            </Formik>
        );

        expect(getByText(/Set a telephone operations start date for questionnaire?/i)).toBeInTheDocument();
    });

    it("should display the totalmobile release date for LMS questionnaires", async () => {
        const { getByText } = render(
            <Formik initialValues={{}} onSubmit={() => {
            }}>
                <DeployFormSummary file={lmsFile} foundQuestionnaire={lmsQuestionnaire} />
            </Formik>
        );

        expect(getByText(/Set a totalmobile release date for questionnaire?/i)).toBeInTheDocument();
    });

    it("should not display the totalmobile release date for non-LMS questionnaires", async () => {
        const { queryByText } = render(
            <Formik initialValues={{}} onSubmit={() => {
            }}>
                <DeployFormSummary file={opnFile} foundQuestionnaire={opnQuestionnaire} />
            </Formik>
        );

        expect(queryByText(/Set a totalmobile release date for questionnaire?/i)).not.toBeInTheDocument();
    });
});
