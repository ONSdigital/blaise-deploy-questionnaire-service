import React, {ReactElement, useState} from "react";
import {ONSPanel} from "./ONSDesignSystem/ONSPanel";
import {Redirect, useHistory, useLocation} from "react-router-dom";
import {ONSButton} from "./ONSDesignSystem/ONSButton";

interface Location {
    state: any
}

interface Props {
    getList: () => void
}

function DeploymentSummary({getList}: Props): ReactElement {
    const [redirect, setRedirect] = useState<boolean>(false);
    const location = useLocation();
    const history = useHistory();
    const {questionnaireName, status} = (location as Location).state || {questionnaireName: "/", status: ""};
    getList();
    return (
        <>
            {
                redirect && <Redirect to="/"/>
            }
            <h1>
                Questionnaire
                file <em>{questionnaireName}</em> {(status === "" ? "deployed" : "deploy failed")}
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
                            <b>File deploy failed</b>

                            <br/>
                            <br/>
                            Questionnaire {questionnaireName} has failed to deploy. When reporting the issue to Service
                            Desk provide the questionnaire name, time and date of failure.
                        </p>
                        <p>
                            Reason: {status}
                        </p>
                    </ONSPanel>)
            }


            <br/>
            <br/>
            {(status !== "" && <ONSButton label="Return to select survey package page"
                                          primary={true}
                                          onClick={() => history.push("/upload")}/>)}
            <ONSButton label="Go to table of questionnaires"
                       primary={(status === "")}
                       onClick={() => setRedirect(true)}/>
        </>
    );
}

export default DeploymentSummary;
