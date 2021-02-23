import React, {ReactElement, useState} from "react";
import {Redirect, Route, Switch, useHistory, useRouteMatch} from "react-router-dom";
import SelectFilePage from "./SelectFilePage";
import AlreadyExists from "./AlreadyExists";
import LiveSurveyWarning from "./LiveSurveyWarning";
import Confirmation from "./Confirmation";
import {Instrument} from "../../../Interfaces";
import {verifyAndInstallInstrument, checkInstrumentAlreadyExists, initialiseUpload} from "../../utilities/http";
import {uploadFile} from "../../utilities/http/upload";

function UploadPage(): ReactElement {
    const [redirect, setRedirect] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [uploading, setUploading] = useState<boolean>(false);
    const [file, setFile] = useState<FileList>();
    const [instrumentName, setInstrumentName] = useState<string>("");
    const [uploadPercentage, setUploadPercentage] = useState<number>(0);
    const [panel, setPanel] = useState<string>("");
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [foundInstrument, setFoundInstrument] = useState<Instrument | null>(null);

    const {path} = useRouteMatch();
    const history = useHistory();

    function roundUp(num: number, precision: number) {
        precision = Math.pow(10, precision);
        return Math.ceil(num * precision) / precision;
    }


    async function BeginUploadProcess() {
        if (file === undefined) {
            setPanel("You must select a file");
            return;
        }
        if (file.length !== 1) {
            setPanel("Invalid file");
            return;
        }

        const fileName = file[0].name;
        const instrumentName = fileName.replace(/\.[a-zA-Z]*$/, "");
        const fileExtension = fileName.match(/\.[a-zA-Z]*$/) || [];

        if (fileExtension[0] !== ".bpkg") {
            setPanel("File must be a .bpkg");
            return;
        }

        setLoading(true);
        setInstrumentName(instrumentName);

        // await UploadFile();
        const [alreadyExists, instrument] = await checkInstrumentAlreadyExists(instrumentName);
        console.log(`alreadyExists ${alreadyExists}`);
        if (alreadyExists === null) {
            setUploadStatus("Failed to validate if questionnaire already exists");
            setRedirect(true);
            return;
        }

        if (alreadyExists) {
            setFoundInstrument(instrument);
            setLoading(false);
            history.push(`${path}/survey-exists`);
        } else {
            await UploadFile();
        }
    }

    async function ConfirmInstrumentOverride() {
        setLoading(true);

        if (foundInstrument?.active) {
            // Survey is Live and so cannot be overwritten
            setLoading(false);
            history.push(`${path}/survey-live`);
        } else {
            // Assume survey is not Live and so confirm the user is happy to override
            setLoading(false);
            history.push(`${path}/survey-confirm`);
        }
    }

    async function UploadFile() {
        if (file === undefined) {
            return;
        }
        console.log("Start uploading the file");
        setLoading(true);
        setPanel("");
        setUploading(true);

        // Get the signed url to allow access to the bucket
        const [initialised, signedUrl] = await initialiseUpload(file[0].name);
        if (!initialised) {
            console.error("Failed to initialiseUpload");
            setUploadStatus("Failed to upload questionnaire");
            setRedirect(true);
            return;
        }

        // Upload the file using the GCP bucket url
        const uploaded = await uploadFile(signedUrl, file[0], onFileUploadProgress);
        if (!uploaded) {
            console.error("Failed to Upload file");
            setUploadStatus("Failed to upload questionnaire");
            setRedirect(true);
            return;
        }
        setUploading(false);

        // Validate the file is in the bucket and call the rest API to install
        verifyAndInstallInstrument(file[0].name)
            .then(([installed, message]) => {
                if (!installed) {
                    setUploadStatus(message);
                }
                setRedirect(true);
            });
    }

    const onFileUploadProgress = (progressEvent: ProgressEvent) => {
        const percentage: number = roundUp((progressEvent.loaded / progressEvent.total) * 100, 2);
        setUploadPercentage(percentage);
    };

    return (
        <>
            {
                redirect && <Redirect
                    to={{
                        pathname: "/UploadSummary",
                        state: {questionnaireName: instrumentName, status: uploadStatus}
                    }}/>
            }

            <Switch>
                <Route exact path={path}>
                    <SelectFilePage BeginUploadProcess={BeginUploadProcess}
                                    setFile={setFile}
                                    loading={loading}
                                    panel={panel}/>
                </Route>
                <Route path={`${path}/survey-exists`}>
                    <AlreadyExists instrumentName={instrumentName}
                                   ConfirmInstrumentOverride={ConfirmInstrumentOverride}
                                   loading={loading}/>
                </Route>
                <Route path={`${path}/survey-live`}>
                    <LiveSurveyWarning instrumentName={instrumentName}/>
                </Route>
                <Route path={`${path}/survey-confirm`}>

                    <Confirmation instrumentName={instrumentName}
                                  UploadFile={UploadFile}
                                  loading={loading}/>
                </Route>
            </Switch>

            {
                uploading &&
                <>
                    <p className="u-mt-m">Uploading: {uploadPercentage}%</p>
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
