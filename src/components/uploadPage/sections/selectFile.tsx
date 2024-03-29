import { ONSPanel, StyledFormErrorSummary, StyledFormField } from "blaise-design-system-react-components";
import React, { ChangeEvent, ReactElement } from "react";
import { FormikContextType, useFormikContext } from "formik";
import { Link } from "react-router-dom";

interface SelectFilePageProps {
    file: File | undefined;
    setFile: any;
    loading: boolean;
}

function SelectFile(props: SelectFilePageProps): ReactElement {
    const { file, setFile } = props;
    const { isSubmitting }: FormikContextType<unknown> = useFormikContext();

    function validateInput() {
        let error;

        if (!file) {
            error = "Select a file";
        } else if (!file.name.endsWith(".bpkg")) {
            error = "File must be a .bpkg";
        }
        return error;
    }

    function handleFileChange(selectorFiles: FileList | null) {
        if (selectorFiles && selectorFiles.length === 1) {
            setFile(selectorFiles[0]);
        }
    }

    const field = {
        name: "Select survey package",
        description: "File type accepted is .bpkg",
        type: "file",
        id: "survey-selector",
        validate: validateInput,
        className: "ons-input ons-input--text ons-input-type__input ons-input--upload",
        onChange: (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files),
        accept: ".bpkg",
        disabled: isSubmitting,
        props: {},
        autoFocus: true,
    };

    return (
        <>
            <h1 className="ons-u-mb-l">Deploy a questionnaire file</h1>
            <p>
                Upload and deploy a new Blaise package.
                You can also <Link to={"/reinstall"}>reinstall a previously uploaded questionnaire</Link>.
            </p>

            <ONSPanel>
                <p>
                    When a questionnaire file is selected and you continue to deploy this questionnaire file, <b>this
                        may take a few minutes</b>.
                    <br />
                    <br />
                    Given this, <b>do not navigate away</b> from this page during this process. You will be
                    re-directed
                    when there is an update regarding the deploy of the questionnaire.
                </p>
            </ONSPanel>

            <StyledFormErrorSummary />

            <StyledFormField {...field} />
        </>
    );
}

export default SelectFile;
