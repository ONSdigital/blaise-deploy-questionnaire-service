import React, { ReactElement } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { ONSButton, ONSPanel } from "blaise-design-system-react-components";

interface Location {
    questionnaireName: string
    status: string
}

function DeploymentSummary(): ReactElement {
    const location = useLocation<Location>();
    const history = useHistory();
    const { questionnaireName, status } = location.state || { questionnaireName: "/" };

    return (
        <>
            <main id="main-content" className="ons-page__main ons-u-mt-no">
                {
                    (status === "" ?
                        <ONSPanel status="success" bigIcon={true}>
                            <h1>
                                Questionnaire
                                file <em>{questionnaireName}</em> deployed
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
                                file <em>{questionnaireName}</em> deploy failed
                            </h1>
                            <ONSPanel status="error">
                                <p>
                                    <b>File deploy failed</b>

                                    <br />
                                    <br />
                                    Questionnaire {questionnaireName} has failed to deploy. When reporting the issue
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
                    onClick={() => history.push("/upload")} />)}
                <ONSButton label="Go to table of questionnaires"
                    primary={(status === "")}
                    onClick={() => history.push("/")} />
            </main>
        </>
    );
}

export default DeploymentSummary;
