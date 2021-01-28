import {Link} from "react-router-dom";
import {ONSPanel} from "../ONSDesignSystem/ONSPanel";
import {ONSUpload} from "../ONSDesignSystem/ONSUpload";
import {ONSButton} from "../ONSDesignSystem/ONSButton";
import React, {ReactElement} from "react";

interface SelectFilePageProps {
    BeginUploadProcess: any
    setFile: any
    loading: boolean
    panel: string
}

function SelectFilePage(props: SelectFilePageProps): ReactElement {
    const {loading, panel, setFile} = props;

    const handleFileChange = (selectorFiles: FileList | null) => {
        console.log(selectorFiles);
        if (selectorFiles !== null) {
            setFile(selectorFiles);
        }
    };

    return (
        <>
            <Link to="/">
                Previous
            </Link>
            <h1 className="u-mt-s">
                Deploy a questionnaire file
            </h1>

            {panel !== "" && <ONSPanel status="error">{panel}</ONSPanel>}

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
                       disabled={loading}/>

            <ONSButton label="Continue"
                       id="continue-deploy-button"
                       primary={true}
                       onClick={() => props.BeginUploadProcess()}
                       loading={loading}/>
        </>
    );
}

export default SelectFilePage;
