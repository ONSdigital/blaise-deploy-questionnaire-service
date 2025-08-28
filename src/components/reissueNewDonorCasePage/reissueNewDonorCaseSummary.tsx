import React, { ReactElement } from "react";
import { ONSPanel } from "blaise-design-system-react-components";

interface Props {
    responseMessage: string;
    statusCode: number;
    role: string;
}

function ReissueNewDonorCaseSummary({ statusCode, role, responseMessage }: Props): ReactElement {

    const message = (typeof responseMessage === "string" && responseMessage.includes("User has no existing donor cases.")) ? "User has not been issued with an initial donor case. Please click 'Create cases' under Donor case section." : "When reporting this issue to the Service Desk, please provide the questionnaire name, user, time and date of the failure.";

    return (
        <>
            <main id="main-content" className="ons-page__main ons-u-mt-no">
                {
                    (statusCode === 200 ?
                        <ONSPanel status="success" bigIcon={true}>
                            <h1>
                                Reissued donor case successfully for {role}
                            </h1>
                        </ONSPanel>
                        :
                        <ONSPanel status="error">
                            
                            <h1>
                                Error reissuing donor case for {role}.
                            </h1>
                            <p>
                                {message}
                            </p>
                        </ONSPanel>
                    )
                }
            </main>
        </>
    );
}

export default ReissueNewDonorCaseSummary;
