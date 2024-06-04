import React, { ReactElement } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ONSButton, ONSPanel } from "blaise-design-system-react-components";

interface Location {
    questionnaireName: string
    message: string
    status: string
}

function createDonorCasesSummary(): ReactElement {
    const location = useLocation().state as Location;
    const navigate = useNavigate();
    const { message, status, questionnaireName } = location || { questionnaireName: "/" };

    return (
        <>
            <main id="main-content" className="ons-page__main ons-u-mt-no">
                {
                    (status === "200" ?
                        <ONSPanel status="success" bigIcon={true}>
                            <h1>
                            Donor cases created successfully for {questionnaireName}
                            </h1>
                        </ONSPanel>
                        :
                        <>
                            <h1 className="ons-u-mb-l ons-u-mt-m">
                                Questionnaire
                                file <em>{message}</em> deploy failed
                            </h1>
                            <ONSPanel status="error">
                                <p>
                                    Error creating donor cases for {questionnaireName}
                                </p>
                                <p>
                                    Reason: {status}
                                </p>
                            </ONSPanel>
                        </>
                    )
                }

                <br />
                <br />
                {(status !== "" && <ONSButton label="Return to select survey package page"
                    primary={true}
                    onClick={() => navigate("/upload")} />)}
                <ONSButton label="Go to table of questionnaires"
                    primary={(status === "")}
                    onClick={() => navigate("/")} />
            </main>
        </>
    );
}

export default createDonorCasesSummary;
