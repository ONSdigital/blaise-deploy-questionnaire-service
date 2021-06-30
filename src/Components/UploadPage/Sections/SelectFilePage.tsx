import {ONSPanel, ONSUpload, StyledFormErrorSummary, StyledFormField} from "blaise-design-system-react-components";
import React, {ChangeEvent, ReactElement} from "react";
import {FormikContextType, useFormikContext} from "formik";

interface SelectFilePageProps {
    file: File | undefined
    setFile: any
    loading: boolean
}

function SelectFilePage(props: SelectFilePageProps): ReactElement {
    const {file, setFile} = props;
    const {isSubmitting}: FormikContextType<unknown> = useFormikContext();

    function validateInput() {
        let error;

        if (!file) {
            error = "Select a file";
        } else if (!file.name.endsWith(".bpkg")) {
            error = "File must be a .bpkg";
        }
        return error;
    }


    const handleFileChange = (selectorFiles: FileList | null) => {
        if (selectorFiles && selectorFiles.length === 1) {
            setFile(selectorFiles[0]);
        }
    };

    const field = {
        name: "Select survey package",
        description: "File type accepted is .bpkg",
        type: "file",
        validate: validateInput,
        className: "input input--text input-type__input input--upload",
        onChange: (e: ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files),
        accept: ".bpkg",
        disabled: isSubmitting
    };

    return (
        <>
            <h1 className="u-mt-s">
                Deploy a questionnaire file
            </h1>

            <ONSPanel>
                <p>
                    When a questionnaire file is selected and you continue to deploy this questionnaire file, <b>this
                    may take a few minutes</b>.
                    <br/>
                    <br/>
                    Given this, <b>do not navigate away</b> from this page during this process. You will be
                    re-directed
                    when there is an update regarding the deploy of the questionnaire.
                </p>
            </ONSPanel>

            <StyledFormErrorSummary/>

            <StyledFormField {...field}/>
        </>
    );
}

export default SelectFilePage;
