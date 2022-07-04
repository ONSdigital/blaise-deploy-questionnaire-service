import React, { ReactElement, useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { ONSButton } from "blaise-design-system-react-components";
import { Form, Formik } from "formik";
import SelectFile from "./sections/selectFile";
import AskToSetTOStartDate from "./sections/askToSetTOStartDate";
import AskToSetTMReleaseDate from "./sections/askToSetTMReleaseDate";
import DeployFormSummary from "./sections/deployFormSummary";
import AlreadyExists from "./sections/alreadyExists";
import ConfirmOverride from "./sections/confirmOverride";
import InvalidSettings from "./sections/invalidSettings";
import { uploadAndInstallFile, validateSelectedQuestionnaireExists, checkQuestionnaireSettings } from "../../client/componentProcesses";
import { roundUp } from "../../utilities/maths";
import Breadcrumbs from "../breadcrumbs";
import { activateQuestionnaire, deleteQuestionnaire } from "../../client/questionnaires";
import { QuestionnaireSettings, Questionnaire } from "blaise-api-node-client";

enum Step {
    SelectFile,
    AlreadyExists,
    ConfirmOverride,
    SetLiveDate,
    SetReleaseDate,
    Summary,
    InvalidSettings
}

function UploadPage(): ReactElement {
    const [file, setFile] = useState<File>();
    const [questionnaireName, setQuestionnaireName] = useState<string>("");
    const [foundQuestionnaire, setFoundQuestionnaire] = useState<Questionnaire | null>(null);
    const [activeStep, setActiveStep] = useState<Step>(Step.SelectFile);

    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadPercentage, setUploadPercentage] = useState<number>(0);
    const [uploadStatus, setUploadStatus] = useState<string>("");

    const [questionnaireSettings, setQuestionnaireSettings] = useState<QuestionnaireSettings>();
    const [invalidSettings, setInvalidSettings] = useState<Partial<QuestionnaireSettings>>({});
    const [errored, setErrored] = useState<boolean>(false);

    const history = useHistory();

    function onFileUploadProgress(progressEvent: ProgressEvent) {
        const percentage: number = roundUp((progressEvent.loaded / progressEvent.total) * 100, 2);
        setUploadPercentage(percentage);
    }

    function submitButton(): string {
        switch (activeStep) {
        case Step.Summary:
            return "Deploy questionnaire";
        case Step.InvalidSettings:
            return "Deploy anyway";
        default:
            return "Continue";
        }
    }

    function cancelButton(): string {
        switch (activeStep) {
        case Step.InvalidSettings:
            return "Cancel";
        default:
            return "Cancel";
        }
    }

    function stepLength(): number {
        return Object.keys(Step).filter(key => isNaN(+key)).length;
    }

    async function cancelButtonAction(): Promise<void> {
        if (activeStep == Step.InvalidSettings) {
            console.log(`Cancelling partial install, uninstalling questionnaire ${questionnaireName}`);
            await deleteQuestionnaire(questionnaireName);
        }
        history.push("/");
    }

    function _renderStepContent(step: Step) {
        switch (step) {
        case Step.SelectFile:
            return (
                <SelectFile file={file}
                    setFile={setFile}
                    loading={false} />
            );
        case Step.AlreadyExists:
            return <AlreadyExists questionnaireName={questionnaireName} />;
        case Step.ConfirmOverride:
            return <ConfirmOverride questionnaireName={questionnaireName} />;
        case Step.SetLiveDate:
            return <AskToSetTOStartDate questionnaireName={questionnaireName} />;
        case Step.SetReleaseDate:
            if (questionnaireName.startsWith("LMS")) {
                return <AskToSetTMReleaseDate questionnaireName={questionnaireName} />;
            }
            setActiveStep(Step.Summary);
            return <DeployFormSummary file={file} foundQuestionnaire={foundQuestionnaire} />;
        case Step.Summary:
            return <DeployFormSummary file={file} foundQuestionnaire={foundQuestionnaire} />;
        case Step.InvalidSettings:
            return <InvalidSettings
                questionnaireName={questionnaireName}
                questionnaireSettings={questionnaireSettings}
                invalidSettings={invalidSettings}
                errored={errored}
            />;
        }
    }

    async function _uploadAndInstallQuestionnaire(values: any, actions: any) {
        const installed = await uploadAndInstallFile(questionnaireName, values["set start date"], values["set release date"], file, setUploading, setUploadStatus, onFileUploadProgress);
        actions.setSubmitting(false);
        if (!installed) {
            setActiveStep(stepLength());
            return;
        }

        await _checkQuestionnaireSettings();
    }

    async function _checkQuestionnaireSettings() {
        const valid = await checkQuestionnaireSettings(questionnaireName, setQuestionnaireSettings, setInvalidSettings, setErrored);

        if (!valid) {
            setActiveStep(Step.InvalidSettings);
            return;
        }
        setActiveStep(stepLength());
    }

    async function _handleSubmit(values: any, actions: any) {
        let result;
        switch (activeStep) {
        case Step.SelectFile:
            result = await validateSelectedQuestionnaireExists(file, setQuestionnaireName, setUploadStatus, setFoundQuestionnaire);
            if (result === null) {
                actions.setTouched({});
                actions.setSubmitting(false);
                setActiveStep(stepLength());
                return;
            }
            if (result === false) {
                setActiveStep(Step.SetLiveDate);
                actions.setTouched({});
                actions.setSubmitting(false);
                return;
            }
            break;
        case Step.AlreadyExists:
            if (values.override === "cancel") {
                actions.setSubmitting(false);
                history.push("/");
                return;
            }
            if (foundQuestionnaire?.active && foundQuestionnaire.status?.toLowerCase() !== "inactive") {
                actions.setSubmitting(false);
                history.push(`/upload/survey-live/${questionnaireName}`);
            }
            break;
        case Step.ConfirmOverride:
            if (values.override === "cancel") {
                actions.setSubmitting(false);
                history.push("/");
                return;
            }
            break;
        case Step.SetLiveDate:
            if (values.askToSetDate === "no") {
                values["set start date"] = "";
            }
            break;
        case Step.SetReleaseDate:
            if (values.askToSetDate === "no") {
                values["set release date"] = "";
            }
            break;
        case Step.Summary:
            await _uploadAndInstallQuestionnaire(values, actions);
            break;
        case Step.InvalidSettings:
            await activateQuestionnaire(questionnaireName);
            break;
        }
        // Summary has custom handling for steps
        if (activeStep != Step.Summary) {
            setActiveStep(activeStep + 1);
        }
        actions.setTouched({});
        actions.setSubmitting(false);
    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" },
                ]
            } />

            <main id="main-content" className="page__main u-mt-no">
                {activeStep >= stepLength() ? (
                    <Redirect
                        to={{
                            pathname: "/UploadSummary",
                            state: { questionnaireName: questionnaireName, status: uploadStatus }
                        }} />
                ) : (
                    <Formik
                        validateOnBlur={false}
                        validateOnChange={false}
                        initialValues={{ override: "", askToSetTOStartDate: "", "set TO start date": "" }}
                        onSubmit={_handleSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form id={"formID"}>
                                {_renderStepContent(activeStep)}

                                <div className="btn-group u-mt-m">
                                    <ONSButton
                                        id={"continue-deploy-button"}
                                        submit={true}
                                        loading={isSubmitting}
                                        primary={true} label={submitButton()} />
                                    {!uploading && !isSubmitting && (
                                        <ONSButton
                                            id={"cancel-deploy-button"}
                                            onClick={cancelButtonAction}
                                            primary={false} label={cancelButton()} />
                                    )}
                                </div>
                            </Form>
                        )}
                    </Formik>
                )}

                {
                    uploading &&
                    <>
                        <p className="u-mt-m">Uploading: {uploadPercentage}%</p>
                        <progress id="file"
                            value={uploadPercentage}
                            max="100"
                            role="progressbar"
                            aria-valuenow={uploadPercentage}
                            aria-valuemin={0}
                            aria-valuemax={100}>
                            {uploadPercentage}%
                        </progress>
                    </>
                }
            </main>
        </>
    );
}

export default UploadPage;
