import { useQueryClient } from "@tanstack/react-query";
import { type AxiosProgressEvent } from "axios";
import { Button, Panel } from "blaise-design-system-react-components";
import { Form, Formik, type FormikHelpers } from "formik";
import React, { type ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  checkQuestionnaireSettings,
  uploadAndInstallFile,
  validateSelectedQuestionnaireExists,
} from "../../api/processes";
import { activateQuestionnaire, deleteQuestionnaire } from "../../api/questionnaires";
import {
  shouldAskTmReleaseDate,
  shouldAskToStartDate,
} from "../../utils/deploymentDateQuestionRules";
import { clientLogger } from "../../utils/logger";
import { AskReleaseDate } from "../shared/dateQuestions/askReleaseDate";
import { AskStartDate } from "../shared/dateQuestions/askStartDate";
import { DeploymentOutcome } from "../shared/deploymentOutcome";

import { ConfirmOverride } from "./sections/confirmOverride";
import { DeploymentSummary } from "./sections/deploymentSummary";
import { InvalidSettings } from "./sections/invalidSettings";
import { QuestionnaireExists } from "./sections/questionnaireExists";
import { SelectFile } from "./sections/selectFile";

import type { Questionnaire, QuestionnaireSettings } from "blaise-api-node-client";

enum Step {
  SelectFile,
  QuestionnaireExists,
  LiveWarning,
  ConfirmOverride,
  SetLiveDate,
  SetReleaseDate,
  Summary,
  InvalidSettings,
}

type UploadFormValues = {
  override: string;
  askStartDate: string;
  "set TO start date": string;
  "set start date"?: string;
  "set release date"?: string;
  askToSetDate?: string;
};

function DeployPage(): ReactElement {
  const queryClient = useQueryClient();
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

  function resetDeployFlow(): void {
    setFile(undefined);
    setQuestionnaireName("");
    setFoundQuestionnaire(null);
    setActiveStep(Step.SelectFile);
    setUploading(false);
    setUploadPercentage(0);
    setUploadStatus("");
    setQuestionnaireSettings(undefined);
    setInvalidSettings({});
    setErrored(false);
  }

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
    if (activeStep === Step.InvalidSettings) {
      clientLogger.info(
        `Cancelling partial install, uninstalling questionnaire ${questionnaireName}`,
      );
      await deleteQuestionnaire(questionnaireName);
    }

    navigate("/");
  }

  function getFirstDateStep(questionnaireName: string): Step {
    if (shouldAskToStartDate(questionnaireName)) {
      return Step.SetLiveDate;
    }

    if (shouldAskTmReleaseDate(questionnaireName)) {
      return Step.SetReleaseDate;
    }

    return Step.Summary;
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
      case Step.QuestionnaireExists:
        return <QuestionnaireExists questionnaireName={questionnaireName} />;
      case Step.LiveWarning:
        return (
          <>
            <Panel status="warn">
              <p>You cannot overwrite questionnaire that are currently live</p>
            </Panel>
            <Button
              label="Accept and go to table of questionnaires"
              primary={true}
              onClick={() => {
                void queryClient.invalidateQueries({ queryKey: ["questionnaires"] });
                navigate("/");
              }}
            />
          </>
        );
      case Step.ConfirmOverride:
        return <ConfirmOverride questionnaireName={questionnaireName} />;
      case Step.SetLiveDate:
        return <AskStartDate questionnaireName={questionnaireName} />;
      case Step.SetReleaseDate:
        if (shouldAskTmReleaseDate(questionnaireName)) {
          return <AskReleaseDate questionnaireName={questionnaireName} />;
        }

        return (
          <DeploymentSummary
            file={file}
            foundQuestionnaire={foundQuestionnaire}
          />
        );
      case Step.Summary:
        return (
          <DeploymentSummary
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

      if (activeStep === Step.SetReleaseDate && shouldAskTmReleaseDate(questionnaireName)) {
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
    _actions: FormikHelpers<UploadFormValues>,
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
      case Step.SelectFile: {
        if (!file) {
          actions.setSubmitting(false);

          return;
        }

        const selectedQuestionnaireName = file.name.replace(/\.[a-zA-Z]*$/, "");

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
          setActiveStep(getFirstDateStep(selectedQuestionnaireName));
          actions.setTouched({});
          actions.setSubmitting(false);

          return;
        }

        break;
      }

      case Step.QuestionnaireExists:
        if (values.override === "cancel") {
          actions.setSubmitting(false);
          navigate("/");

          return;
        }

        if (foundQuestionnaire?.active && foundQuestionnaire?.hasData) {
          setActiveStep(Step.LiveWarning);
          actions.setTouched({});
          actions.setSubmitting(false);

          return;
        }

        setActiveStep(Step.ConfirmOverride);
        actions.setTouched({});
        actions.setSubmitting(false);

        return;
      case Step.ConfirmOverride:
        if (values.override === "cancel") {
          actions.setSubmitting(false);
          navigate("/");

          return;
        }

        setActiveStep(getFirstDateStep(questionnaireName));
        actions.setTouched({});
        actions.setSubmitting(false);

        return;
      case Step.SetLiveDate:
        if (values.askToSetDate === "no") {
          values["set start date"] = "";
        }

        values.askToSetDate = "";

        if (!shouldAskTmReleaseDate(questionnaireName)) {
          setActiveStep(Step.Summary);
          actions.setTouched({});
          actions.setSubmitting(false);

          return;
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
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        {activeStep >= stepLength() ? (
          <DeploymentOutcome
            questionnaireName={questionnaireName}
            status={uploadStatus}
            onRetry={resetDeployFlow}
            retryLabel="Return to deploy questionnaire"
            onViewQuestionnaires={() => {
              void queryClient.invalidateQueries({ queryKey: ["questionnaires"] });
              navigate("/");
            }}
          />
        ) : (
          <Formik
            validateOnBlur={false}
            validateOnChange={false}
            initialValues={{ override: "", askStartDate: "", "set TO start date": "" }}
            onSubmit={_handleSubmit}
          >
            {({ isSubmitting, values }) => (
              <Form id={"formID"}>
                {_renderStepContent(activeStep)}

                <div className="ons-btn-group ons-u-mt-m">
                  {activeStep !== Step.LiveWarning && (
                    <>
                      <Button
                        id={"continue-deploy-button"}
                        submit={true}
                        loading={isSubmitting}
                        disabled={isSubmitting || isContinueDisabled(values)}
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
                    </>
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

export default DeployPage;
