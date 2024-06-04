import React, { ReactElement } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ONSButton, ONSPanel } from "blaise-design-system-react-components";

interface Props {
    donorCasesResponseMessage: string;
    donorCasesStatusCode: number;
}

function createDonorCasesSummary({ donorCasesResponseMessage, donorCasesStatusCode }: Props): ReactElement {

    return (
        <>
            <main id="main-content" className="ons-page__main ons-u-mt-no">
                {
                    (donorCasesStatusCode === 200 ?
                        <ONSPanel status="success" bigIcon={true}>
                            <h1>
                            Donor cases created successfully for {donorCasesResponseMessage}
                            </h1>
                        </ONSPanel>
                        :
                        <>
                            <h1 className="ons-u-mb-l ons-u-mt-m">
                                Questionnaire
                                file <em>{donorCasesResponseMessage}</em> deploy failed
                            </h1>
                            <ONSPanel status="error">
                                <p>
                                    Error creating donor cases for {donorCasesResponseMessage}
                                </p>
                                <p>
                                    Reason: {status}
                                </p>
                            </ONSPanel>
                        </>
                    )
                }
            </main>
        </>
    );
}

export default createDonorCasesSummary;
