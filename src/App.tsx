import React, {ReactElement, useEffect, useState} from "react";
import {DefaultErrorBoundary} from "./Components/ErrorHandling/DefaultErrorBoundary";
import {Switch, Route, Link, useLocation} from "react-router-dom";
import InstrumentList from "./Components/InstrumentList";
import {Instrument} from "../Interfaces";
import {ErrorBoundary} from "./Components/ErrorHandling/ErrorBoundary";
import UploadPage from "./Components/UploadPage/UploadPage";
import DeploymentSummary from "./Components/DeploymentSummary";
import DeleteConfirmation from "./Components/DeleteConfirmation";
import StatusPage from "./Components/StatusPage";
import {
    NotProductionWarning,
    Footer,
    Header,
    BetaBanner,
    ONSPanel,
    ONSErrorPanel
} from "blaise-design-system-react-components";
import {getAllInstruments} from "./utilities/http";
import AuditPage from "./Components/AuditPage";

const divStyle = {
    minHeight: "calc(67vh)"
};

interface Location {
    state: any
}

function App(): ReactElement {
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const [listError, setListError] = useState<string>("Loading ...");

    const location = useLocation();
    const {status} = (location as Location).state || {status: ""};

    useEffect(() => {
        getInstrumentList().then(() => console.log("Call getInstrumentList Complete"));
    }, []);

    async function getInstrumentList() {
        setInstruments([]);

        const [success, instrumentList] = await getAllInstruments();

        if (!success) {
            setListError("Unable to load questionnaires");
            return;
        }

        if (instrumentList.length === 0) {
            setListError("No installed questionnaires found.");
        }

        setInstruments(instrumentList);
    }

    return (
        <>
            {
                (window.location.hostname.includes("dev")) && <NotProductionWarning/>
            }
            <BetaBanner/>
            <Header title={"Deploy Questionnaire Service"}/>
            <div style={divStyle} className="page__container container">
                <main id="main-content" className="page__main">
                    <DefaultErrorBoundary>

                        <Switch>
                            <Route path="/status">
                                <StatusPage/>
                            </Route>
                            <Route path="/audit">
                                <AuditPage/>
                            </Route>
                            <Route path="/UploadSummary">
                                <DeploymentSummary getList={getInstrumentList}/>
                            </Route>
                            <Route path="/upload">
                                <UploadPage/>
                            </Route>
                            <Route path="/delete">
                                <DeleteConfirmation getList={getInstrumentList}/>
                            </Route>
                            <Route path="/">

                                {status !== "" && <ONSPanel status="success">{status}</ONSPanel>}
                                {listError.includes("Unable") && <ONSErrorPanel/>}

                                <ul className="list list--bare list--inline u-mt-m">
                                    <li className="list__item">
                                        <Link to="/upload" id="deploy-questionnaire-link">
                                            Deploy a questionnaire
                                        </Link>
                                    </li>
                                    <li className="list__item">
                                        <Link to="/audit" id="audit-logs-link">
                                            View deployment history
                                        </Link>
                                    </li>
                                    <li className="list__item">
                                        <Link to="/status" id="blaise-status-link">
                                            Check Blaise status
                                        </Link>
                                    </li>
                                </ul>

                                <ONSPanel>
                                    <p>
                                        Any <b>live</b> questionnaire within the table below <b>does not</b> have the
                                        option to delete and <b>cannot be deleted</b>.

                                        If a <b>live</b> questionnaire requires deletion, raise a Service Desk ticket to
                                        complete this request.
                                    </p>
                                </ONSPanel>
                                <ErrorBoundary errorMessageText={"Unable to load questionnaire table correctly"}>
                                    <InstrumentList list={instruments} listError={listError}/>
                                </ErrorBoundary>
                            </Route>
                        </Switch>
                    </DefaultErrorBoundary>
                </main>
            </div>
            <Footer/>
        </>
    );
}

export default App;
