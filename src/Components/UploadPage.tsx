import React, {ReactElement, useState} from "react";
import ONSErrorPanel from "./ONSDesignSystem/ONSErrorPanel";
import {ONSPanel} from "./ONSDesignSystem/ONSPanel";
import {Link, Redirect} from "react-router-dom";
import {ONSUpload} from "./ONSDesignSystem/ONSUpload";
import {ONSButton} from "./ONSDesignSystem/ONSButton";
import uploadImage from "../Upload";

interface Props {
    external_client_url: string
}


function UploadPage(props: Props): ReactElement {
    const [redirect, setRedirect] = useState<boolean>(false);
    const [file, setFile] = useState<FileList>();

    function UploadFile() {
        console.log("Yeah that didn't work");
    }

    const handleFileChange = (selectorFiles: FileList | null) => {
        console.log(selectorFiles);
        if (selectorFiles !== null) {
            setFile(selectorFiles);
        }
    };

    return (
        <>
            {
                redirect && <Redirect to="/UploadSummary"/>
            }
            <Link to="/">
                Previous
            </Link>
            <h1>
                Deploy a questionnaire file
            </h1>
            <ONSPanel>
                <p>
                    When a questionnaire file is selected and you continue to deploy this questionnaire file, <b>this
                    may take a few minutes</b>.
                    <br/>
                    <br/>
                    Given this, <b>do not navigate away</b> from this page during this process. You will be re-directed
                    when there is an update regarding the deploy of the questionnaire.
                </p>
            </ONSPanel>

            <ONSUpload label="Select survey package" description="File type accepted is .bpkg only" fileName="Package"
                       fileID="ID" accept="bpkg" onChange={(e) => handleFileChange(e.target.files)}/>
            <ONSButton label="Continue" primary={true} onClick={() => UploadFile()}/>
        </>
    );
}

export default UploadPage;
