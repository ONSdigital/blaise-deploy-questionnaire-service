import { type AxiosProgressEvent } from "axios";
import type { Questionnaire, QuestionnaireSettings } from "blaise-api-node-client";
import { Button } from "blaise-design-system-react-components";
import { Form, Formik, type FormikHelpers } from "formik";
import React, { type ReactElement, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import {
  checkQuestionnaireSettings,
  uploadAndInstallFile,
  validateSelectedQuestionnaireExists,
} from "../../client/componentProcesses";
import { activateQuestionnaire, deleteQuestionnaire } from "../../client/questionnaires";
import { totalmobileReleaseDateSurveyTLAs } from "../../utilities/totalmobileReleaseDateSurveyTLAs";
import Breadcrumbs from "../breadcrumbs";

import AlreadyExists from "./sections/alreadyExists";
import AskToSetTmReleaseDate from "./sections/askToSetTmReleaseDate";
import AskToSetToStartDate from "./sections/askToSetToStartDate";
import ConfirmOverride from "./sections/confirmOverride";
import DeployFormSummary from "./sections/deployFormSummary";
import InvalidSettings from "./sections/invalidSettings";
import SelectFile from "./sections/selectFile";

enum Step {
  SelectFile,
  AlreadyExists,
  ConfirmOverride,
  SetLiveDate,
  SetReleaseDate,
  Summary,
  InvalidSettings,
}

type UploadFormValues = {
  override: string;
  askToSetToStartDate: string;
  "set TO start date": string;
  "set start date"?: string;
  "set release date"?: string;
  askToSetDate?: string;
};

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

  const navigate = useNavigate();

  function onFileUploadProgress(progressEvent: AxiosProgressEvent) {
    const percentage: number = progressEvent.total
      ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
      : 0;

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
    return Object.keys(Step).filter((key) => isNaN(+key)).length;
  }

  async function cancelButtonAction(): Promise<void> {
    if (activeStep == Step.InvalidSettings) {
      console.log(`Cancelling partial install, uninstalling questionnaire ${questionnaireName}`);
      await deleteQuestionnaire(questionnaireName);
    }

    navigate("/");
  }

  function _renderStepContent(step: Step) {
    switch (step) {
      case Step.SelectFile:
        return (
          <SelectFile
            file={file}
            setFile={setFile}
            loading={false}
          />
        );
      case Step.AlreadyExists:
        return <AlreadyExists questionnaireName={questionnaireName} />;
      case Step.ConfirmOverride:
        return <ConfirmOverride questionnaireName={questionnaireName} />;
      case Step.SetLiveDate:
        return <AskToSetToStartDate questionnaireName={questionnaireName} />;
      case Step.SetReleaseDate:
        if (totalmobileReleaseDateSurveyTLAs.some((tla) => questionnaireName.startsWith(tla))) {
          return <AskToSetTmReleaseDate questionnaireName={questionnaireName} />;
        }

        setActiveStep(Step.Summary);

        return (
          <DeployFormSummary
            file={file}
            foundQuestionnaire={foundQuestionnaire}
          />
        );
      case Step.Summary:
        return (
          <DeployFormSummary
            file={file}
            foundQuestionnaire={foundQuestionnaire}
          />
        );
      case Step.InvalidSettings:
        return (
          <InvalidSettings
            questionnaireName={questionnaireName}
            questionnaireSettings={questionnaireSettings}
            invalidSettings={invalidSettings}
            errored={errored}
          />
        );
    }
  }

  function isContinueDisabled(values: UploadFormValues): boolean {
    if (activeStep !== Step.SelectFile) {
      if (activeStep === Step.SetLiveDate) {
        if (values.askToSetDate !== "yes" && values.askToSetDate !== "no") {
          return true;
        }

        return values.askToSetDate === "yes" && !values["set start date"];
      }

      if (
        activeStep === Step.SetReleaseDate &&
        totalmobileReleaseDateSurveyTLAs.some((tla) => questionnaireName.startsWith(tla))
      ) {
        if (values.askToSetDate !== "yes" && values.askToSetDate !== "no") {
          return true;
        }

        return values.askToSetDate === "yes" && !values["set release date"];
      }

      return false;
    }

    return !file || !file.name.endsWith(".bpkg");
  }

  async function _uploadAndInstallQuestionnaire(
    values: UploadFormValues,
    actions: FormikHelpers<UploadFormValues>,
  ) {
    const installed = await uploadAndInstallFile(
      questionnaireName,
      values["set start date"],
      values["set release date"],
      file,
      setUploading,
      setUploadStatus,
      onFileUploadProgress,
    );

    actions.setSubmitting(false);
    if (!installed) {
      setActiveStep(stepLength());

      return;
    }

    await _checkQuestionnaireSettings();
  }

  async function _checkQuestionnaireSettings() {
    const valid = await checkQuestionnaireSettings(
      questionnaireName,
      setQuestionnaireSettings,
      setInvalidSettings,
      setErrored,
    );

    if (!valid) {
      setActiveStep(Step.InvalidSettings);

      return;
    }

    setActiveStep(stepLength());
  }

  async function _handleSubmit(values: UploadFormValues, actions: FormikHelpers<UploadFormValues>) {
    let result;

    switch (activeStep) {
      case Step.SelectFile:
        if (!file) {
          actions.setSubmitting(false);

          return;
        }

        result = await validateSelectedQuestionnaireExists(
          file,
          setQuestionnaireName,
          setUploadStatus,
          setFoundQuestionnaire,
        );
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
          navigate("/");

          return;
        }

        if (foundQuestionnaire?.active && foundQuestionnaire.status?.toLowerCase() !== "inactive") {
          actions.setSubmitting(false);
          navigate(`/upload/survey-live/${questionnaireName}`);
        }

        break;
      case Step.ConfirmOverride:
        if (values.override === "cancel") {
          actions.setSubmitting(false);
          navigate("/");

          return;
        }

        break;
      case Step.SetLiveDate:
        if (values.askToSetDate === "no") {
          values["set start date"] = "";
        }

        values.askToSetDate = "";

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
      <Breadcrumbs breadcrumbList={[{ link: "/", title: "Home" }]} />

      <main
        id="main-content"
        className="ons-page__main ons-u-mt-no"
      >
        {activeStep >= stepLength() ? (
          <Navigate
            to="/UploadSummary"
            state={{ questionnaireName: questionnaireName, status: uploadStatus }}
            replace={true}
          />
        ) : (
          <Formik
            validateOnBlur={false}
            validateOnChange={false}
            initialValues={{ override: "", askToSetToStartDate: "", "set TO start date": "" }}
            onSubmit={_handleSubmit}
          >
            {({ isSubmitting, values }) => (
              <Form id={"formID"}>
                {_renderStepContent(activeStep)}

                <div className="ons-btn-group ons-u-mt-m">
                  <Button
                    id={"continue-deploy-button"}
                    submit={true}
                    loading={isSubmitting}
                    disabled={isContinueDisabled(values)}
                    primary={true}
                    label={submitButton()}
                  />
                  {!uploading && !isSubmitting && (
                    <Button
                      id={"cancel-deploy-button"}
                      onClick={cancelButtonAction}
                      primary={false}
                      label={cancelButton()}
                    />
                  )}
                </div>
              </Form>
            )}
          </Formik>
        )}

        {uploading && (
          <>
            <p className="ons-u-mt-m">Uploading: {uploadPercentage}%</p>
            <progress
              id="file"
              value={uploadPercentage}
              max="100"
              role="progressbar"
              aria-valuenow={uploadPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {uploadPercentage}%
            </progress>
          </>
        )}
      </main>
    </>
  );
}

export default UploadPage;
