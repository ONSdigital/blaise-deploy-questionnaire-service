import React from "react";
import {ONSButton, ONSPanel} from "blaise-design-system-react-components";
import {useHistory} from "react-router-dom";


interface Props {
    instrumentName: string
}

function LiveSurveyWarning({instrumentName}: Props) {
    const history=useHistory();
    return (
        <>
            <h1>Cannot overwrite questionnaire <em> {instrumentName} </em> as it is currently live.</h1>

            <ONSPanel status="error">
                <p>
                    Note, you cannot overwrite questionnaire that are currently live.
                    <br/>
                    When reporting the issue to Service Desk provide the questionnaire name, time and date of failure.
                </p>
            </ONSPanel>
            <br/>
            <br/>
            <ONSButton label="Accept and go to table of questionnaires"
                primary={true}
                       id="return-to-home"
                       onClick={() => history.push("/")}/>

        </>
    );
}

export default LiveSurveyWarning;
