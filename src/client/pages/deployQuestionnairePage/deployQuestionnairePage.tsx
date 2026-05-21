import { useQueryClient } from "@tanstack/react-query";
import { type AxiosProgressEvent } from "axios";
import { Button, Panel } from "blaise-design-system-react-components";
import { Form, Formik, type FormikHelpers } from "formik";
import { type ReactElement, useState } from "react";
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
import { AskTmReleaseDate } from "../shared/dateQuestions/askTmReleaseDate";
import { AskToStartDate } from "../shared/dateQuestions/askToStartDate";
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
  SetToStartDate,
  SetTmReleaseDate,
  Summary,
  InvalidSettings,
  Complete,
}

type UploadFormValues = {
  askDate: string;
  toStartDate: string;
  tmReleaseDate: string;
};

const initialValues: UploadFormValues = {
  askDate: "",
  toStartDate: "",
  tmReleaseDate: "",
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
    return "Cancel";
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
      return Step.SetToStartDate;
    }

    if (shouldAskTmReleaseDate(questionnaireName)) {
      return Step.SetTmReleaseDate;
    }

    return Step.Summary;
  }

  function renderStepContent(step: Step) {
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
            <div className="ons-u-mb-m">
              <Panel status="error">
                <p>You cannot overwrite a questionnaire that is currently live</p>
              </Panel>
            </div>
            <div className="ons-btn-group ons-u-mt-m">
              <Button
                label="View questionnaires"
                primary={true}
                onClick={() => {
                  void queryClient.invalidateQueries({ queryKey: ["questionnaires"] });
                  navigate("/");
                }}
              />
            </div>
          </>
        );
      case Step.ConfirmOverride:
        return <ConfirmOverride questionnaireName={questionnaireName} />;
      case Step.SetToStartDate:
        return <AskToStartDate questionnaireName={questionnaireName} />;
      case Step.SetTmReleaseDate:
        if (shouldAskTmReleaseDate(questionnaireName)) {
          return <AskTmReleaseDate questionnaireName={questionnaireName} />;
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
      if (activeStep === Step.SetToStartDate) {
        if (values.askDate !== "yes" && values.askDate !== "no") {
          return true;
        }

        return values.askDate === "yes" && !values.toStartDate;
      }

      if (activeStep === Step.SetTmReleaseDate && shouldAskTmReleaseDate(questionnaireName)) {
        if (values.askDate !== "yes" && values.askDate !== "no") {
          return true;
        }

        return values.askDate === "yes" && !values.tmReleaseDate;
      }

      return false;
    }

    return !file || !file.name.endsWith(".bpkg");
  }

  async function handleUploadAndInstall(
    values: UploadFormValues,
    _actions: FormikHelpers<UploadFormValues>,
  ) {
    setUploading(true);
    const result = await uploadAndInstallFile(
      questionnaireName,
      values.toStartDate,
      values.tmReleaseDate,
      file!,
      onFileUploadProgress,
    );

    setUploading(false);

    if (!result.success) {
      setUploadStatus(result.message);
      setActiveStep(Step.Complete);

      return;
    }

    await handleCheckSettings();
  }

  async function handleCheckSettings() {
    const result = await checkQuestionnaireSettings(questionnaireName);

    if (result.outcome === "error") {
      setErrored(true);
      setActiveStep(Step.InvalidSettings);

      return;
    }

    if (result.outcome === "invalid") {
      setQuestionnaireSettings(result.settings);
      setInvalidSettings(result.invalidSettings);
      setActiveStep(Step.InvalidSettings);

      return;
    }

    setActiveStep(Step.Complete);
  }

  async function handleSubmit(values: UploadFormValues, actions: FormikHelpers<UploadFormValues>) {
    let result;

    switch (activeStep) {
      case Step.SelectFile: {
        if (!file) {
          actions.setSubmitting(false);

          return;
        }

        const selectedQuestionnaireName = file.name.replace(/\.[a-zA-Z]*$/, "");

        result = await validateSelectedQuestionnaireExists(file);
        if (result.outcome === "error") {
          setUploadStatus(result.message);
          actions.setTouched({});
          actions.setSubmitting(false);
          setActiveStep(Step.Complete);

          return;
        }

        if (result.outcome === "new") {
          setQuestionnaireName(result.questionnaireName);
          setActiveStep(getFirstDateStep(selectedQuestionnaireName));
          actions.setTouched({});
          actions.setSubmitting(false);

          return;
        }

        setQuestionnaireName(result.questionnaireName);
        setFoundQuestionnaire(result.questionnaire);
        break;
      }

      case Step.QuestionnaireExists:
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
        setActiveStep(getFirstDateStep(questionnaireName));
        actions.setTouched({});
        actions.setSubmitting(false);

        return;
      case Step.SetToStartDate:
        if (values.askDate === "no") {
          values.toStartDate = "";
        }

        values.askDate = "";

        if (!shouldAskTmReleaseDate(questionnaireName)) {
          setActiveStep(Step.Summary);
          actions.setTouched({});
          actions.setSubmitting(false);

          return;
        }

        break;
      case Step.SetTmReleaseDate:
        if (values.askDate === "no") {
          values.tmReleaseDate = "";
        }

        break;
      case Step.Summary:
        await handleUploadAndInstall(values, actions);
        break;
      case Step.InvalidSettings:
        await activateQuestionnaire(questionnaireName);
        break;
    }

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
        {activeStep === Step.Complete ? (
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
          <Formik<UploadFormValues>
            validateOnBlur={false}
            validateOnChange={false}
            initialValues={initialValues}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values }) => (
              <Form id={"formID"}>
                {renderStepContent(activeStep)}

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
