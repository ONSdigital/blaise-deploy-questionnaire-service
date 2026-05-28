import { Upload } from "blaise-design-system-react-components";
import { type FormikContextType, useFormikContext } from "formik";
import { type ReactElement, useEffect } from "react";
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
  const {
    errors,
    isSubmitting,
    setFieldError,
    setFieldTouched,
    submitCount,
    touched,
  }: FormikContextType<SelectFileFormValues> = useFormikContext();

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
      <h1 className="ons-u-mb-l">Deploy questionnaire</h1>
      <p>
        Upload and deploy a questionnaire package. You can also{" "}
        <Link to={"/reinstall"}>reinstall a previously uploaded questionnaire</Link>.
      </p>

      <div className="ons-grid ons-u-mt-m">
        <div className="ons-grid__col ons-col-8@m ons-col-6@l">
          <Upload
            id="survey-selector"
            label="Select questionnaire package"
            description="Accepted file type: bpkg"
            fileName="Select survey package"
            accept=".bpkg"
            onChange={(e) => handleFileChange(e.target.files)}
            disabled={isSubmitting}
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

export { SelectFile };
