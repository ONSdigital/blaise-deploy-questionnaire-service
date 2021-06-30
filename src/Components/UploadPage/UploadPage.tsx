import React, {ReactElement, useState} from "react";
import {Redirect, useHistory} from "react-router-dom";
import {ONSButton} from "blaise-design-system-react-components";
// import Breadcrumbs from "../Components/Breadcrumbs";
import {Formik, Form} from "formik";
import SelectFile from "./Sections/SelectFile";
import AskToSetLiveDate from "./Sections/AskToSetLiveDate";
import DeployFormSummary from "./Sections/DeployFormSummary";
import {Instrument} from "../../../Interfaces";
import AlreadyExists from "./Sections/AlreadyExists";
import ConfirmOverride from "./Sections/ConfirmOverride";
import {uploadAndInstallFile, validateSelectedInstrumentExists} from "./UploadProcess";
import {roundUp} from "../../utilities";

const steps = ["Select file", "Already exits prompt", "Confirm Override", "Want to set a live date", "Summary"];


function UploadPage(): ReactElement {
    const [file, setFile] = useState<File>();
    const [instrumentName, setInstrumentName] = useState<string>("");
    const [foundInstrument, setFoundInstrument] = useState<Instrument | null>(null);
    const [activeStep, setActiveStep] = useState(0);
    const isLastStep = activeStep === steps.length - 1;

    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadPercentage, setUploadPercentage] = useState<number>(0);
    const [uploadStatus, setUploadStatus] = useState<string>("");

    const history = useHistory();


    const onFileUploadProgress = (progressEvent: ProgressEvent) => {
        const percentage: number = roundUp((progressEvent.loaded / progressEvent.total) * 100, 2);
        setUploadPercentage(percentage);
    };

    function _renderStepContent(step: number) {
        switch (step) {
            case 0:
                return (
                    <SelectFile file={file}
                                setFile={setFile}
                                loading={false}/>
                );
            case 1:
                return <AlreadyExists instrumentName={instrumentName}/>;
            case 2:
                return <ConfirmOverride instrumentName={instrumentName}/>;
            case 3:
                return <AskToSetLiveDate instrumentName={instrumentName}/>;
            case 4:
                return <DeployFormSummary file={file} foundInstrument={foundInstrument}/>;
            default:
                return <div>Not Found</div>;
        }
    }

    async function _submitForm(values: any, actions: any) {
        await uploadAndInstallFile(instrumentName, values["set live date"], file, setUploading, setUploadStatus, onFileUploadProgress);
        actions.setSubmitting(false);

        setActiveStep(activeStep + 1);
    }

    async function _handleSubmit(values: any, actions: any) {
        let result;
        if (isLastStep) {
            await _submitForm(values, actions);
        } else {
            switch (activeStep) {
                case 0:
                    result = await validateSelectedInstrumentExists(file, setInstrumentName, setUploadStatus, setFoundInstrument);
                    if (result === null) {
                        actions.setTouched({});
                        actions.setSubmitting(false);
                        setActiveStep(steps.length);
                        return;
                    }
                    if (result === false) {
                        setActiveStep(3);
                        actions.setTouched({});
                        actions.setSubmitting(false);
                        return;
                    }
                    break;
                case 1:
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
                case 2:
                    if (values.override === "cancel") {
                        actions.setSubmitting(false);
                        history.push("/");
                        return;
                    }
                    break;
                case 3:
                    if (values.askToSetLiveDate === "no") {
                        values["set live date"] = undefined;
                    }
                    break;
                default:
                    break;
            }
            setActiveStep(activeStep + 1);
            actions.setTouched({});
            actions.setSubmitting(false);
        }
    }

    return (
        <>
            {/*<Breadcrumbs BreadcrumbList={*/}
            {/*    [*/}
            {/*        {link: "/", title: "Home"},*/}
            {/*    ]*/}
            {/*}/>*/}

            <main id="main-content" className="page__main u-mt-no">
                {activeStep === steps.length ? (
                    <Redirect
                        to={{
                            pathname: "/UploadSummary",
                            state: {questionnaireName: instrumentName, status: uploadStatus}
                        }}/>
                ) : (
                    <Formik
                        validateOnBlur={false}
                        validateOnChange={false}
                        initialValues={{override: "", askToSetLiveDate: "", "set live date": ""}}
                        onSubmit={_handleSubmit}
                    >
                        {({isSubmitting}) => (
                            <Form id={"formID"}>
                                {_renderStepContent(activeStep)}


                                <div className="btn-group u-mt-m">
                                    <ONSButton
                                        id={"continue-deploy-button"}
                                        submit={true}
                                        loading={isSubmitting}
                                        primary={true} label={isLastStep ? "Deploy questionnaire" : "Continue"}/>
                                    {!uploading && !isSubmitting && (
                                        <ONSButton
                                            onClick={() => history.push("/")}
                                            primary={false} label={"Cancel"}/>
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
