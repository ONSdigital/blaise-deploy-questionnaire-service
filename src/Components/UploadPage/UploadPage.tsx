import React, { ReactElement, useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { ONSButton } from "blaise-design-system-react-components";
import { Form, Formik } from "formik";
import SelectFile from "./Sections/SelectFile";
import AskToSetTOStartDate from "./Sections/AskToSetTOStartDate";
import DeployFormSummary from "./Sections/DeployFormSummary";
import { Instrument } from "../../../Interfaces";
import AlreadyExists from "./Sections/AlreadyExists";
import ConfirmOverride from "./Sections/ConfirmOverride";
import InvalidSettings from "./Sections/InvalidSettings";
import { uploadAndInstallFile, validateSelectedInstrumentExists, checkInstrumentSettings } from "./UploadProcess";
import { roundUp } from "../../utilities";
import Breadcrumbs from "../Breadcrumbs";
import { activateInstrument, deleteInstrument } from "../../utilities/http";
import { InstrumentSettings } from "blaise-api-node-client";

enum Step {
    SelectFile,
    AlreadyExists,
    ConfirmOverride,
    SetLiveDate,
    Summary,
    InvalidSettings
}


function UploadPage(): ReactElement {
    const [file, setFile] = useState<File>();
    const [instrumentName, setInstrumentName] = useState<string>("");
    const [foundInstrument, setFoundInstrument] = useState<Instrument | null>(null);
    const [activeStep, setActiveStep] = useState<Step>(Step.SelectFile);

    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadPercentage, setUploadPercentage] = useState<number>(0);
    const [uploadStatus, setUploadStatus] = useState<string>("");

    const [instrumentSettings, setInstrumentSettings] = useState<InstrumentSettings>();
    const [invalidSettings, setInvalidSettings] = useState<Partial<InstrumentSettings>>({});
    const [errored, setErrored] = useState<boolean>(false);

    const history = useHistory();


    const onFileUploadProgress = (progressEvent: ProgressEvent) => {
        const percentage: number = roundUp((progressEvent.loaded / progressEvent.total) * 100, 2);
        setUploadPercentage(percentage);
    };

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
            console.log(`Cancelling partial install, uninstalling questionnaire ${instrumentName}`);
            await deleteInstrument(instrumentName);
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
                return <AlreadyExists instrumentName={instrumentName} />;
            case Step.ConfirmOverride:
                return <ConfirmOverride instrumentName={instrumentName} />;
            case Step.SetLiveDate:
                return <AskToSetTOStartDate instrumentName={instrumentName} />;
            case Step.Summary:
                return <DeployFormSummary file={file} foundInstrument={foundInstrument} />;
            case Step.InvalidSettings:
                return <InvalidSettings
                    instrumentName={instrumentName}
                    instrumentSettings={instrumentSettings}
                    invalidSettings={invalidSettings}
                    errored={errored}
                />;
        }
    }

    async function _uploadAndInstallInstrument(values: any, actions: any) {
        const installed = await uploadAndInstallFile(instrumentName, values["set TO start date"], file, setUploading, setUploadStatus, onFileUploadProgress);
        actions.setSubmitting(false);
        if (!installed) {
            setActiveStep(stepLength());
            return;
        }

        await _checkInstrumentSettings();
    }

    async function _checkInstrumentSettings() {
        const valid = await checkInstrumentSettings(instrumentName, setInstrumentSettings, setInvalidSettings, setErrored);

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
                result = await validateSelectedInstrumentExists(file, setInstrumentName, setUploadStatus, setFoundInstrument);
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
                if (foundInstrument?.active) {
                    actions.setSubmitting(false);
                    history.push(`/upload/survey-live/${instrumentName}`);
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
                if (values.askToSetTOStartDate === "no") {
                    values["set TO start date"] = "";
                }
                break;
            case Step.Summary:
                await _uploadAndInstallInstrument(values, actions);
                break;
            case Step.InvalidSettings:
                await activateInstrument(instrumentName);
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
                            state: { questionnaireName: instrumentName, status: uploadStatus }
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
