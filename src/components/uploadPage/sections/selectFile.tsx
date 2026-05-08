import {
  Panel,
  StyledFormErrorSummary,
} from "blaise-design-system-react-components";
import { type FormikContextType, useFormikContext } from "formik";
import React, { type ChangeEvent, type ReactElement, useEffect } from "react";
import { Link } from "react-router-dom";

interface SelectFilePageProps {
  file: File | undefined;
  setFile: (file: File | undefined) => void;
  loading: boolean;
}

type SelectFileFormValues = {
  "Select survey package"?: string;
};

function SelectFile(props: SelectFilePageProps): ReactElement {
  const { file, setFile } = props;
  const { errors, isSubmitting, setFieldError, setFieldTouched, submitCount, touched }:
    FormikContextType<SelectFileFormValues> = useFormikContext();

  function validateSelectedFile(selectedFile: File | undefined): string | undefined {
    if (!selectedFile) {
      return "Select a file";
    }

    if (!selectedFile.name.endsWith(".bpkg")) {
      return "File must be a .bpkg";
    }

    return undefined;
  }

  useEffect(() => {
    if (submitCount === 0) {
      return;
    }

    const error = validateSelectedFile(file);

    setFieldTouched("Select survey package", true, false);
    setFieldError("Select survey package", error);
  }, [file, setFieldError, setFieldTouched, submitCount]);

  const currentFileError = touched["Select survey package"]
    ? errors["Select survey package"]
    : undefined;

  function handleFileChange(selectorFiles: FileList | null) {
    const selectedFile = selectorFiles && selectorFiles.length === 1 ? selectorFiles[0] : undefined;
    const error = validateSelectedFile(selectedFile);

    setFile(selectedFile);
    setFieldTouched("Select survey package", true, false);
    setFieldError("Select survey package", error);
  }

  return (
    <>
      <h1 className="ons-u-mb-l">Deploy a questionnaire file</h1>
      <p>
        Upload and deploy a new Blaise package. You can also{" "}
        <Link to={"/reinstall"}>reinstall a previously uploaded questionnaire</Link>.
      </p>

      <Panel>
        <p>
          When a questionnaire file is selected and you continue to deploy this questionnaire file,{" "}
          <b>this may take a few minutes</b>.
          <br />
          <br />
          Given this, <b>do not navigate away</b> from this page during this process. You will be
          re-directed when there is an update regarding the deploy of the questionnaire.
        </p>
      </Panel>

      <StyledFormErrorSummary />

      <div className="ons-grid">
        <div className="ons-grid__col ons-col-8@m ons-col-6@l">
          <label
            className="ons-label ons-label--with-description"
            htmlFor="survey-selector"
          >
            Select survey package
          </label>
          <span
            className="ons-label__description ons-input--with-description"
            id="survey-selector-description-hint"
          >
            File type accepted is .bpkg
          </span>
          <input
            accept=".bpkg"
            aria-describedby="survey-selector-description-hint"
            aria-invalid={Boolean(currentFileError)}
            className="ons-input ons-input--text ons-input-type__input ons-input--upload"
            data-testid="survey-selector-input"
            id="survey-selector"
            name="Select survey package"
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files)}
            type="file"
            disabled={isSubmitting}
            autoFocus
          />
          {currentFileError && (
            <span
              className="ons-input__error"
              id="survey-selector-error"
            >
              {currentFileError}
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default SelectFile;
