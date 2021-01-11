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
    const [uploadPercentage, setUploadPercentage] = useState<number>(0);

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
                console.log(`File upload ${percent}%`);
                setUploadPercentage(percent);
            })
            .options({
                chunkSize: 5 * 1024 * 1024,
                threadsQuantity: 5
            })
            .send(file[0])
            .end((error: Error, data: string) => {
                if (error) {
                    console.log("Error", error);
                    setLoading(false);
                    return;
                }
                setTimeout(function () {
                    checkFileInBucket(file[0].name.replace(/ /g, "_"));
                }, 3000);
            });
    }

    function checkFileInBucket(filename: string) {
        fetch(`/bucket?filename=${filename}`)
            .then((r: Response) => {
                if (r.status !== 200) {
                    throw r.status + " - " + r.statusText;
                }
                r.json()
                    .then((json) => {
                        console.log(json);
                        if (json.name === filename) {
                            console.log(`File ${filename} successfully uploaded to bucket`);
                            setRedirect(true);
                            setLoading(false);
                        }
                    })
                    .catch((error) => {
                        console.error("Failed to validate if file is in bucket, error: " + error);
                    }).catch((error) => {
                        console.error("Failed to validate if file is in bucket, error: " + error);
                    }
                );
            }).catch((error) => {
            console.error("Failed to validate if file is in bucket, error: " + error);
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
                    Given this, <b>do not navigate away</b> from this page during this process. You will be
                    re-directed
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
            {
                loading &&
                <>
                    <p>Uploading: {uploadPercentage}%</p>
                    <progress id="file"
                              value={uploadPercentage}
                              max="100"
                              role="progressbar"
                              aria-valuenow={uploadPercentage}
                              aria-valuemin={0}
                              aria-valuemax={100}>
                        {uploadPercentage}%
                    </progress>

                </>
            }

        </>
    );
}

export default UploadPage;
