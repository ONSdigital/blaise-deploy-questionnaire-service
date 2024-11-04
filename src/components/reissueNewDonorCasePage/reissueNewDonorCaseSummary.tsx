import React, { ReactElement } from "react";
import { ONSPanel } from "blaise-design-system-react-components";

interface Props {
    responseMessage: string;
    statusCode: number;
    role: string;
}

function ReissueNewDonorCaseSummary({ statusCode, role }: Props): ReactElement {

    return (
        <>
            <main id="main-content" className="ons-page__main ons-u-mt-no">
                {
                    (statusCode === 200 ?
                        <ONSPanel status="success" bigIcon={true}>
                            <h1>
                                Reissued donor case created successfully for {role}
                            </h1>
                        </ONSPanel>
                        :
                        <ONSPanel status="error">
                            <h1>
                                Error reissuing new donor case for {role}
                            </h1>
                            <p>
                                When reporting this issue to the Service Desk, please provide the questionnaire name, user, time and date of the failure.
                            </p>
                        </ONSPanel>
                    )
                }
            </main>
        </>
    );
}

export default ReissueNewDonorCaseSummary;
