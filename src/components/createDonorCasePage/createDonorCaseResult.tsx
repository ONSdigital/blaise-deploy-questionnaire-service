import React, { ReactElement } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ONSButton, ONSPanel } from "blaise-design-system-react-components";

interface Location {
    message: string
    status: string
}

function CreateDonorCasesResult(): ReactElement {
    const location = useLocation().state as Location;
    const navigate = useNavigate();
    const { message, status } = location || { questionnaireName: "/" };

    return (
        <>
            <main id="main-content" className="ons-page__main ons-u-mt-no">
                {
                    (status === "" ?
                        <ONSPanel status="success" bigIcon={true}>
                            <h1>
                                Questionnaire
                                file <em>{message}</em> deployed
                            </h1>
                            <p>
                                The questionnaire file has been successfully deployed and will be displayed within
                                the
                                table
                                of
                                questionnaires.
                            </p>
                        </ONSPanel>
                        :
                        <>
                            <h1 className="ons-u-mb-l ons-u-mt-m">
                                Questionnaire
                                file <em>{message}</em> deploy failed
                            </h1>
                            <ONSPanel status="error">
                                <p>
                                    <b>File deploy failed</b>

                                    <br />
                                    <br />
                                    Questionnaire {message} has failed to deploy. When reporting the issue
                                    to
                                    Service
                                    Desk provide the questionnaire name, time and date of failure.
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

export default CreateDonorCasesResult;
