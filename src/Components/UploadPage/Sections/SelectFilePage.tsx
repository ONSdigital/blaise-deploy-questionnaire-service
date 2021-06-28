import {ONSPanel, ONSUpload} from "blaise-design-system-react-components";
import React, {ReactElement} from "react";
import {FormikContextType, useFormikContext} from "formik";

interface SelectFilePageProps {
    setFile: any
    loading: boolean
}

function SelectFilePage(props: SelectFilePageProps): ReactElement {
    const {setFile} = props;

    const {isSubmitting}: FormikContextType<unknown> = useFormikContext();

    const handleFileChange = (selectorFiles: FileList | null) => {
        if (selectorFiles && selectorFiles.length === 1) {
            setFile(selectorFiles[0]);
        }
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

            <ONSUpload label="Select survey package"
                       description="File type accepted is .bpkg"
                       fileName="Package"
                       fileID="survey-selector"
                       accept=".bpkg"
                       onChange={(e) => handleFileChange(e.target.files)}
                       disabled={isSubmitting}/>
        </>
    );
}

export default SelectFilePage;
