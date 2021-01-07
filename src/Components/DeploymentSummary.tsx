import React, {ReactElement, useState} from "react";
import ONSErrorPanel from "./ONSDesignSystem/ONSErrorPanel";
import {ONSPanel} from "./ONSDesignSystem/ONSPanel";
import {Link, Redirect, useLocation} from "react-router-dom";
import {ONSUpload} from "./ONSDesignSystem/ONSUpload";
import {ONSButton} from "./ONSDesignSystem/ONSButton";

interface Location {
    state: any
}

function DeploymentSummary(): ReactElement {
    const [redirect, setRedirect] = useState<boolean>(false);
    const location = useLocation();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
    const {questionnaireName} = (location as Location).state || {questionnaireName: "/"};
    return (
        <>
            {
                redirect && <Redirect to="/"/>
            }
            <h1>
                Questionnaire file <em> {questionnaireName.replace(/\.[a-zA-Z]*$/,"")} </em> deployed
            </h1>
            <ONSPanel status="success">
                <p>
                    The questionnaire file has been successfully deployed and will be displayed within the table of
                    questionnaires.
                </p>
            </ONSPanel>

            <br/>
            <br/>

            <ONSButton label="Go to table of questionnaires"
                       primary={true} onClick={() => setRedirect(true)}/>
        </>
    );
}

export default DeploymentSummary;
