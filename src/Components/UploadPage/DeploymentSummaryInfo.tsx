import React, {ReactElement} from "react";
import {ONSPanel} from "blaise-design-system-react-components";
import {step_status} from "./DeploymentProgress";

interface Props {
    status: string
    instrumentName: string
}

function DeploymentSummaryInfo({status, instrumentName}: Props): ReactElement {
    return (
        (status === "" ?
                <ONSPanel status="success" bigIcon={true}>
                    <h1>
                        Questionnaire
                        file <em>{instrumentName}</em> deployed
                    </h1>
                    <p>
                        The questionnaire file has been successfully deployed and will be displayed within the
                        table
                        of
                        questionnaires.
                    </p>
                </ONSPanel>
                :
                <>
                    <h1>
                        Questionnaire
                        file <em>{instrumentName}</em> deploy failed
                    </h1>
                    <ONSPanel status="error">
                        <p>
                            <b>File deploy failed</b>

                            <br/>
                            <br/>
                            Questionnaire {instrumentName} has failed to deploy. When reporting the issue to
                            Service
                            Desk provide the questionnaire name, time and date of failure.
                        </p>
                        <p>
                            Reason: {status}
                        </p>
                    </ONSPanel>
                </>
        )
    );
}

export default DeploymentSummaryInfo;
