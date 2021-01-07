import React, {ReactElement, useState} from "react";
import ONSErrorPanel from "./ONSDesignSystem/ONSErrorPanel";
import {ONSPanel} from "./ONSDesignSystem/ONSPanel";
import {Link, Redirect} from "react-router-dom";
import {ONSUpload} from "./ONSDesignSystem/ONSUpload";
import {ONSButton} from "./ONSDesignSystem/ONSButton";
import uploader from "../uploader";

interface Progress {
    loaded: number
    total: number
}

interface Panel {
    status: string
    hidden: boolean
    text: string
}

function UploadPage(): ReactElement {
    const [redirect, setRedirect] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [file, setFile] = useState<FileList>();
    const [fileName, setFileName] = useState<string>("");
    const [panel, setPanel] = useState<Panel>({status: "info", hidden: true, text: ""});

    async function UploadFile() {
        if (file === undefined) {
            setPanel({status: "error", hidden: false, text: "You must select a file "});
            return;
        }
        if (file.length !== 1) {
            return;
        }
        setLoading(true);
        setFileName(file[0].name);
        setPanel({status: "info", hidden: true, text: ""});
        uploader()
            .onProgress(({loaded, total}: Progress) => {
                const percent = Math.round(loaded / total * 100 * 100) / 100;
                console.log(percent);
            })
            .options({
                chunkSize: 10 * 1024 * 1024,
                threadsQuantity: 5
            })
            .send(file[0])
            .end((error: Error, data: string) => {
                setLoading(false);
                if (error) {
                    console.log("Error", error);
                    return;
                }
                setRedirect(true);
            });
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
                redirect && <Redirect to={{pathname: "/UploadSummary", state: {questionnaireName: fileName}}}/>
            }
            <Link to="/">
                Previous
            </Link>
            <h1>
                Deploy a questionnaire file
            </h1>

            <ONSPanel hidden={panel.hidden} status={panel.status}>{panel.text}</ONSPanel>

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

            <ONSUpload label="Select survey package"
                       description="File type accepted is .bpkg only"
                       fileName="Package"
                       fileID="ID" accept="bpkg"
                       onChange={(e) => handleFileChange(e.target.files)}/>
            <ONSButton label="Continue"
                       primary={true}
                       onClick={() => UploadFile()}
                       loading={loading}/>
        </>
    );
}

export default UploadPage;
