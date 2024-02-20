import React, { ReactElement } from "react";
import { ONSButton, ONSPanel } from "blaise-design-system-react-components";
import { useNavigate, useParams } from "react-router-dom";

function LiveSurveyWarning(): ReactElement {
    const navigate = useNavigate();

    const { questionnaireName } = useParams();

    return (
        <>
            <ONSPanel status="error">
                <h1>Cannot overwrite questionnaire <em>{questionnaireName}</em> as it is currently live.</h1>
                <p>
                    Note, you cannot overwrite questionnaire that are currently live.
                    <br />
                    When reporting the issue to Service Desk provide the questionnaire name, time and date of failure.
                </p>
            </ONSPanel>
            <br />
            <br />
            <ONSButton label="Accept and go to table of questionnaires"
                primary={true}
                id="return-to-home"
                onClick={() => navigate("/")} />

        </>
    );
}

export default LiveSurveyWarning;
