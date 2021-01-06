import React, {ReactElement, useState} from "react";
import ONSErrorPanel from "./ONSDesignSystem/ONSErrorPanel";
import {ONSPanel} from "./ONSDesignSystem/ONSPanel";
import {Link, Redirect} from "react-router-dom";
import {ONSUpload} from "./ONSDesignSystem/ONSUpload";
import {ONSButton} from "./ONSDesignSystem/ONSButton";

interface Props {
    external_client_url: string
}


function DeploymentSummary(props: Props): ReactElement {
    const [redirect, setRedirect] = useState<boolean>(false);
    return (
        <>
            {
                redirect && <Redirect to="/"/>
            }
            <h1>
                Questionnaire file <em> {"string"} </em> deployed
            </h1>
            <ONSPanel status="success">
                <p>
                    The questionnaire file has been successfully deployed and will be displayed within the table of
                    questionnaires.
                </p>
            </ONSPanel>

            <br/>
            <br/>

            <ONSButton label="Go to table of questionnaires" primary={true} onClick={() => setRedirect(true)}/>
        </>
    );
}

export default DeploymentSummary;
