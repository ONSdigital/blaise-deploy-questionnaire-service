import React, { ReactElement } from "react";
import { ONSPanel } from "blaise-design-system-react-components";

interface Props {
    reissueNewDonorCaseResponseMessage: string;
    reissueNewDonorCaseStatusCode: number;
    user: string;
}

function ReissueNewDonorCaseSummary({ reissueNewDonorCaseResponseMessage, reissueNewDonorCaseStatusCode, user }: Props): ReactElement {

    return (
        <>
            <main id="main-content" className="ons-page__main ons-u-mt-no">
                {
                    (reissueNewDonorCaseStatusCode === 200 ?
                        <ONSPanel status="success" bigIcon={true}>
                            <h1>
                                Reissued donor case created successfully for {user}
                            </h1>
                        </ONSPanel>
                        :
                        <ONSPanel status="error">
                            <h1>
                                Error reissuing new donor case for {user}
                            </h1>
                            <p>
                                {reissueNewDonorCaseResponseMessage}
                            </p>
                            <p>
                                When reporting this issue to the Service Desk, please provide the questionnaire name, time and date of the failure.
                            </p>
                        </ONSPanel>
                    )
                }
            </main>
        </>
    );
}

export default ReissueNewDonorCaseSummary;
