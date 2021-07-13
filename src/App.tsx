import React, {ReactElement, useEffect, useState} from "react";
import {DefaultErrorBoundary} from "./Components/ErrorHandling/DefaultErrorBoundary";
import {Switch, Route, Link, useLocation} from "react-router-dom";
import InstrumentList from "./Components/InstrumentList";
import {Instrument} from "../Interfaces";
import {ErrorBoundary} from "./Components/ErrorHandling/ErrorBoundary";
import UploadPage from "./Components/UploadPage/UploadPage";
import DeploymentSummary from "./Components/DeploymentSummary";
import DeleteConfirmation from "./Components/DeletePage/DeleteConfirmation";
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
import ReinstallInstruments from "./Components/ReinstallInstruments";
import LiveSurveyWarning from "./Components/UploadPage/LiveSurveyWarning";
import "./style.css";

const divStyle = {
    minHeight: "calc(67vh)"
};

interface Location {
    state: any
}

function App(): ReactElement {
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const [listLoading, setListLoading] = useState<boolean>(true);
    const [listMessage, setListMessage] = useState<string>("");

    const location = useLocation();
    const {status} = (location as Location).state || {status: ""};

    useEffect(() => {
        getInstrumentList().then(() => console.log("getInstrumentList complete"));
    }, []);

    async function getInstrumentList() {
        setListLoading(true);
        setInstruments([]);

        const [success, instrumentList] = await getAllInstruments();
        console.log("get all instruments successful hello");

        if (!success) {
            setListMessage("Unable to load questionnaires");
            setListLoading(false);
            return;
        }

        if (instrumentList.length === 0) {
            setListMessage("No installed questionnaires found.");
        }

        setInstruments(instrumentList);
        setListLoading(false);
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
                            <Route path="/reinstall">
                                <ReinstallInstruments installedInstruments={instruments}/>
                            </Route>
                            <Route path="/audit">
                                <AuditPage/>
                            </Route>
                            <Route path="/UploadSummary">
                                <DeploymentSummary getList={getInstrumentList}/>
                            </Route>
                            <Route path={"/upload/survey-live/:instrumentName"}>
                                <LiveSurveyWarning/>
                            </Route>
                            <Route path="/upload">
                                <UploadPage/>
                            </Route>
                            <Route path="/delete">
                                <DeleteConfirmation getList={getInstrumentList}/>
                            </Route>
                            <Route path="/">

                                {status !== "" && <ONSPanel status="success">{status}</ONSPanel>}
                                {listMessage.includes("Unable") && <ONSErrorPanel/>}

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
                                <h2 className="u-mt-m">Table of questionnaires</h2>
                                <ErrorBoundary errorMessageText={"Unable to load questionnaire table correctly"}>
                                    <InstrumentList instrumentList={instruments} listMessage={listMessage} loading={listLoading}/>
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
