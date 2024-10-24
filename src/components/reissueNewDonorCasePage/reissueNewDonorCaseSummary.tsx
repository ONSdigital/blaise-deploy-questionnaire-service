import React, { ReactElement } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ONSButton, ONSPanel } from "blaise-design-system-react-components";

interface Props {
    donorCasesResponseMessage: string;
    donorCasesStatusCode: number;
    role: string;
}

function ReissueNewDonorCaseSummary({ donorCasesResponseMessage, donorCasesStatusCode, role }: Props): ReactElement {

    return (
        <>
            <main id="main-content" className="ons-page__main ons-u-mt-no">
                {
                    (donorCasesStatusCode === 200 ?
                        <ONSPanel status="success" bigIcon={true}>
                            <h1>
                                Reissued donor case created successfully for {role}
                            </h1>
                        </ONSPanel>
                        :
                        <ONSPanel status="error">
                            <h1>
                                Error reissuing new donor cases for {role}
                            </h1>
                            <p>
                                {donorCasesResponseMessage}
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
