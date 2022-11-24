import { ONSButton, ONSPanel } from "blaise-design-system-react-components";
import React, { ReactElement } from "react";
import { useHistory } from "react-router-dom";

interface Props {
    questionnaireName: string
}

function ErroneousWarning({ questionnaireName }: Props): ReactElement {
    const history = useHistory();

    return (
        <>
            <ONSPanel status="error">
                <h1>Unable to delete questionnaire <em className="ons-highlight">{questionnaireName}</em> because it is in a failed state.</h1>
                <p>An error has occurred with the questionnaire, in this state it cannot be deleted.</p>
                <p>You can <a href="https://ons.service-now.com/">report this issue</a> to Service Desk.</p>
            </ONSPanel>
            <br />
            <ONSButton label="Return to table of questionnaires"
                primary={true}
                onClick={() => history.push("/")} />
        </>
    );
}

export default ErroneousWarning;
