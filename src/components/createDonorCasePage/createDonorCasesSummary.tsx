import React, { ReactElement } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ONSButton, ONSPanel } from "blaise-design-system-react-components";

interface Props {
    donorCasesResponseMessage: string;
    donorCasesStatusCode: number;
    role: string;
}

function CreateDonorCasesSummary({ donorCasesResponseMessage, donorCasesStatusCode, role }: Props): ReactElement {

    return (
        <>
            <main id="main-content" className="ons-page__main ons-u-mt-no">
                {
                    (donorCasesStatusCode === 200 ?
                        <ONSPanel status="success" bigIcon={true}>
                            <h1>
                                Donor cases created successfully for {role}
                            </h1>
                        </ONSPanel>
                        :
                        <ONSPanel status="error">
                            <p>
                                Error creating donor cases for {role}
                            </p>
                            <p>
                                Reason: {donorCasesResponseMessage}
                            </p>
                        </ONSPanel>
                    )
                }
            </main>
        </>
    );
}

export default CreateDonorCasesSummary;
