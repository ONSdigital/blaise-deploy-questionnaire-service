import {ONSButton, ONSPanel} from "blaise-design-system-react-components";
import React, {ReactElement} from "react";

interface Props {
    instrumentName: string
    setRedirect: (string: boolean) => void
}

function ErroneousWarning({instrumentName, setRedirect}: Props): ReactElement {
    return (
        <>
            <ONSPanel status="error">
                <h1>Unable to delete questionnaire <em className="highlight">{instrumentName}</em> because the status is
                    Erroneous</h1>
                <p>An error has occurred with the questionnaire, in this state it cannot be deleted.</p>
                <p>You can <a href="https://ons.service-now.com/">report this issue</a> to Service Desk.</p>
            </ONSPanel>
            <br/>
            <ONSButton label="Return to table of questionnaires"
                       primary={true}
                       onClick={() => setRedirect(true)}/>
        </>
    );
}

export default ErroneousWarning;
