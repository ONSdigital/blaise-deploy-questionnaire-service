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
    const frsQuestionnaireName = "FRS2004A";
    const opnQuestionnaireName = "OPN2004A";
    const lastModified = new Date("2022-01-24T01:02:03").getTime();

    const validFiles = [
        { file: new File(["龴ↀ◡ↀ龴"], `${lmsQuestionnaireName}.bpkg`, { type: "application/pdf", lastModified: lastModified }), questionnaire: questionnaireWithName(lmsQuestionnaireName) },
        { file: new File(["(♥_♥)"], `${frsQuestionnaireName}.bpkg`, { type: "application/pdf", lastModified: lastModified }), questionnaire: questionnaireWithName(frsQuestionnaireName) }
    ];

    const opnFile = new File(["(♥_♥)"], `${opnQuestionnaireName}.bpkg`, {
        type: "application/pdf", lastModified: lastModified
    });

    const opnQuestionnaire = questionnaireWithName(opnQuestionnaireName);

    validFiles.forEach(({ file, questionnaire }) => {
        it(`should match the Snapshot for ${file.name}`, async () => {
            const wrapper = render(
                <Formik initialValues={{}} onSubmit={() => { }}>
                    <DeployFormSummary file={file} foundQuestionnaire={questionnaire} />
                </Formik>
            );

            expect(wrapper).toMatchSnapshot();
        });
    });

    validFiles.forEach(({ file, questionnaire }) => {
        it(`should display the questionnaire file name for ${file.name}`, async () => {
            const { getByText } = render(
                <Formik initialValues={{}} onSubmit={() => { }}>
                    <DeployFormSummary file={file} foundQuestionnaire={questionnaire} />
                </Formik>
            );
    
            expect(getByText(/Questionnaire file name/i)).toBeInTheDocument();
        });
    });

    it("should display when the file was last modified", async () => {
        const { file, questionnaire } = validFiles[0];
        const { getByText } = render(
            <Formik initialValues={{}} onSubmit={() => { }}>
                <DeployFormSummary file={file} foundQuestionnaire={questionnaire} />
            </Formik>
        );
    
        expect(getByText(/Questionnaire file last modified date/i)).toBeInTheDocument();
    });

    it("should display the questionnaire file size", async () => {
        const { file, questionnaire } = validFiles[0];
        const { getByText } = render(
            <Formik initialValues={{}} onSubmit={() => { }}>
                <DeployFormSummary file={file} foundQuestionnaire={questionnaire} />
            </Formik>
        );
    
        expect(getByText(/Questionnaire file size/i)).toBeInTheDocument();
    });

    it("should display if the questionnaire exists in Blaise", async () => {
        const { file, questionnaire } = validFiles[0];
        const { getByText } = render(
            <Formik initialValues={{}} onSubmit={() => { }}>
                <DeployFormSummary file={file} foundQuestionnaire={questionnaire} />
            </Formik>
        );

        expect(getByText(/Does the questionnaire already exist in blaise?/i)).toBeInTheDocument();
    });

    it("should display the telephone operation start date", async () => {
        const { file, questionnaire } = validFiles[0];
        const { getByText } = render(
            <Formik initialValues={{}} onSubmit={() => { }}>
                <DeployFormSummary file={file} foundQuestionnaire={questionnaire} />
            </Formik>
        );
    
        expect(getByText(/Set a telephone operations start date for questionnaire?/i)).toBeInTheDocument();
    });

    validFiles.forEach(({ file, questionnaire }) => {
        it(`should display the totalmobile release date for ${file.name} questionnaires`, async () => {
            const { getByText } = render(
                <Formik initialValues={{}} onSubmit={() => { }}>
                    <DeployFormSummary file={file} foundQuestionnaire={questionnaire} />
                </Formik>
            );
    
            expect(getByText(/Set a totalmobile release date for questionnaire?/i)).toBeInTheDocument();
        });
    });    

    it("should not display the totalmobile release date for non-LMS, non-FRS questionnaires", async () => {
        const { queryByText } = render(
            <Formik initialValues={{}} onSubmit={() => {
            }}>
                <DeployFormSummary file={opnFile} foundQuestionnaire={opnQuestionnaire} />
            </Formik>
        );

        expect(queryByText(/Set a totalmobile release date for questionnaire?/i)).not.toBeInTheDocument();
    });
});
