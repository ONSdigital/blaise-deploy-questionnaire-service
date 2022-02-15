import React, { ReactElement, useEffect, useState } from "react";
import { Redirect, useHistory, useLocation } from "react-router-dom";
import { ONSButton, ONSPanel } from "blaise-design-system-react-components";

interface Location {
    state: any;
}

interface Props {
    getList: () => Promise<void>;
}

function DeploymentSummary({ getList }: Props): ReactElement {
    const [redirect, setRedirect] = useState<boolean>(false);
    const location = useLocation();
    const history = useHistory();
    const { questionnaireName, status } = (location as Location).state || { questionnaireName: "/", status: "" };

    useEffect(() => {
        getList().then(() => console.log("getInstrumentList complete"));
    }, []);

    return (
        <>
            {
                redirect && <Redirect to="/" />
            }


            <main id="main-content" className="page__main u-mt-no">
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
                            <h1 className="u-mb-l u-mt-m">
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
                    onClick={() => setRedirect(true)} />
            </main>
        </>
    );
}

export default DeploymentSummary;
