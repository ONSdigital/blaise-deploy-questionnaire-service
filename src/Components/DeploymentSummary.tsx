import React, {ReactElement, useState} from "react";
import {ONSPanel} from "./ONSDesignSystem/ONSPanel";
import {Redirect, useLocation} from "react-router-dom";
import {ONSButton} from "./ONSDesignSystem/ONSButton";

interface Location {
    state: any
}

function DeploymentSummary(): ReactElement {
    const [redirect, setRedirect] = useState<boolean>(false);
    const location = useLocation();

    const {questionnaireName, status} = (location as Location).state || {questionnaireName: "/", status: ""};
    console.log(status);
    return (
        <>
            {
                redirect && <Redirect to="/"/>
            }
            <h1>
                Questionnaire file <em> {questionnaireName.replace(/\.[a-zA-Z]*$/, "")} </em> deployed
            </h1>
            {
                (status === "" ?
                    <ONSPanel status="success">
                        <p>
                            The questionnaire file has been successfully deployed and will be displayed within the table
                            of
                            questionnaires.
                        </p>
                    </ONSPanel>
                    :
                    <ONSPanel status="error">
                        <p>
                            The questionnaire file has failed to deploy. Reason:
                        </p>
                        <p>
                            {status}
                        </p>
                    </ONSPanel>)
            }


            <br/>
            <br/>

            <ONSButton label="Go to table of questionnaires"
                       primary={true} onClick={() => setRedirect(true)}/>
        </>
    );
}

export default DeploymentSummary;
