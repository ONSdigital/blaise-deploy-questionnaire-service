import React, {ReactElement, useState} from "react";
import {Route, Switch, useHistory, useRouteMatch} from "react-router-dom";
import SelectFilePage from "./SelectFilePage";
import AlreadyExists from "./AlreadyExists";
import LiveSurveyWarning from "./LiveSurveyWarning";
import Confirmation from "./Confirmation";
import {Instrument} from "../../../Interfaces";
import {step_status} from "./DeploymentProgress";
import {
    checkInstrumentAlreadyExists,
    initialiseUpload,
    sendInstallRequest,
    validateUploadIsComplete
} from "../../utilities/http";
import {uploadFile} from "../../utilities/http";
import DeploymentSummary from "../DeploymentSummary";

interface Props {
    reloadList: () => void
}

function UploadPage({reloadList}: Props): ReactElement {
    const [loading, setLoading] = useState<boolean>(false);
    const [isDeploying, setIsDeploying] = useState<boolean>(false);
    const [isVerifyIsInstalled, setIsVerifyIsInstalled] = useState<string>(step_status.NOT_STARTED);
    const [isInitialisingUpload, setIsInitialisingUpload] = useState<string>(step_status.NOT_STARTED);
    const [uploading, setUploading] = useState<string>(step_status.NOT_STARTED);
    const [isVerifyingUpload, setIsVerifyingUpload] = useState<string>(step_status.NOT_STARTED);
    const [isInstalling, setIsInstalling] = useState<string>(step_status.NOT_STARTED);
    const [file, setFile] = useState<FileList>();
    const [instrumentName, setInstrumentName] = useState<string>("");
    const [uploadPercentage, setUploadPercentage] = useState<number>(0);
    const [panel, setPanel] = useState<string>("");
    const [foundInstrument, setFoundInstrument] = useState<Instrument | null>(null);

    const deploymentSteps = {
        instrumentName: instrumentName,
        isVerifyIsInstalled: isVerifyIsInstalled,
        isInstalling: isInstalling,
        isUploading: uploading,
        isVerifyingUpload: isVerifyingUpload,
        isInitialisingUpload: isInitialisingUpload,
        uploadPercentage: uploadPercentage
    };

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
        setIsVerifyIsInstalled(step_status.IN_PROGRESS);
        const [alreadyExists, instrument] = await checkInstrumentAlreadyExists(instrumentName);
        if (alreadyExists === null) {
            showDeploymentStatusPage();
            endDeploymentProcess();
            setIsVerifyIsInstalled(step_status.FAILED);
            return;
        }
        setIsVerifyIsInstalled(step_status.COMPLETE);

        if (alreadyExists) {
            setFoundInstrument(instrument);
            setLoading(false);
            history.push(`${path}/survey-exists`);
        } else {
            await UploadFile();
        }
    }

    function showDeploymentStatusPage() {
        history.push(`${path}/summary`);
    }

    function endDeploymentProcess() {
        setIsDeploying(false);
        setLoading(false);
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
        setIsDeploying(true);
        setLoading(true);
        setPanel("");
        showDeploymentStatusPage();
        setIsInitialisingUpload(step_status.IN_PROGRESS);

        // Get the signed url to allow access to the bucket
        const [initialised, signedUrl] = await initialiseUpload(file[0].name);
        if (!initialised) {
            console.error("Failed to initialiseUpload");
            setIsInitialisingUpload(step_status.FAILED);
            endDeploymentProcess();
            return;
        }

        setIsInitialisingUpload(step_status.COMPLETE);
        setUploading(step_status.IN_PROGRESS);
        // Upload the file using the GCP bucket url
        const uploaded = await uploadFile(signedUrl, file[0], onFileUploadProgress);
        if (!uploaded) {
            console.error("Failed to Upload file");
            setUploading(step_status.FAILED);
            endDeploymentProcess();
            return;
        }

        setUploading(step_status.COMPLETE);
        setIsVerifyingUpload(step_status.IN_PROGRESS);
        // Validate the file is in the bucket and call the rest API to install
        const fileFound = await validateUploadIsComplete(file[0].name);
        if (!fileFound) {
            console.error("Failed to validate if file has been uploaded");
            setIsVerifyingUpload(step_status.FAILED);
            endDeploymentProcess();
            return;
        }

        setIsVerifyingUpload(step_status.COMPLETE);
        setIsInstalling(step_status.IN_PROGRESS);
        const installSuccess = await sendInstallRequest(file[0].name);
        if (!installSuccess) {
            console.error("Failed to install the questionnaire");
            setIsInstalling(step_status.FAILED);
        }
        setIsInstalling(step_status.COMPLETE);
        endDeploymentProcess();
    }

    const onFileUploadProgress = (progressEvent: ProgressEvent) => {
        const percentage: number = roundUp((progressEvent.loaded / progressEvent.total) * 100, 2);
        setUploadPercentage(percentage);
    };

    return (
        <>
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
                <Route path={`${path}/summary`}>
                    <DeploymentSummary deploymentSteps={deploymentSteps}
                                       isDeploying={isDeploying}
                                       getList={() => reloadList()}/>
                </Route>
            </Switch>
        </>
    );
}

export default UploadPage;
