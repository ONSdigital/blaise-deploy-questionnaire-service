import React, {ReactElement, useEffect, useState} from "react";
import {Redirect, useHistory} from "react-router-dom";
import {ONSButton} from "blaise-design-system-react-components";
import DeploymentProgress, {step_status} from "./UploadPage/DeploymentProgress";
import DeploymentSummaryInfo from "./UploadPage/DeploymentSummaryInfo";

interface Props {
    isDeploying: boolean
    getList: () => void
    deploymentSteps: DeploymentSteps
}

interface DeploymentSteps {
    instrumentName: string
    isVerifyIsInstalled: string
    isInstalling: string
    isUploading: string
    isVerifyingUpload: string
    isInitialisingUpload: string
    uploadPercentage: number
}

function DeploymentSummary({getList, isDeploying, deploymentSteps}: Props): ReactElement {
    const [redirect, setRedirect] = useState<boolean>(false);
    const history = useHistory();
    const {instrumentName, isInstalling} = deploymentSteps;

    useEffect(() => {
        getList();
    }, [isDeploying]);

    return (
        <>
            {
                redirect && <Redirect to="/"/>
            }
            {
                isDeploying ?
                    <h1>
                        Deployment of <em>{instrumentName}</em> in progress
                    </h1>
                    :
                    <DeploymentSummaryInfo status={isInstalling} instrumentName={instrumentName}/>
            }

            <DeploymentProgress instrumentName={instrumentName}
                                isVerifyIsInstalled={deploymentSteps.isVerifyIsInstalled}
                                isInstalling={deploymentSteps.isInstalling}
                                isUploading={deploymentSteps.isUploading}
                                isVerifyingUpload={deploymentSteps.isVerifyingUpload}
                                isInitialisingUpload={deploymentSteps.isInitialisingUpload}
                                uploadPercentage={deploymentSteps.uploadPercentage}/>

            {
                !isDeploying &&
                <>
                    <br/>
                    {(isInstalling !== step_status.COMPLETE && <ONSButton label="Return to select survey package page"
                                                                          primary={true}
                                                                          onClick={() => history.push("/upload")}/>)}
                    <ONSButton label="Go to table of questionnaires"
                               primary={(deploymentSteps.isInstalling === step_status.COMPLETE)}
                               onClick={() => setRedirect(true)}/>
                </>
            }

        </>
    );
}

export default DeploymentSummary;
