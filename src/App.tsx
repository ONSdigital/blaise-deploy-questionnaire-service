import React, {ReactElement, useEffect, useState} from "react";
import Header from "./Components/ONSDesignSystem/Header";
import BetaBanner from "./Components/ONSDesignSystem/BetaBanner";
import {DefaultErrorBoundary} from "./Components/ErrorHandling/DefaultErrorBoundary";
import Footer from "./Components/ONSDesignSystem/Footer";
import ONSErrorPanel from "./Components/ONSDesignSystem/ONSErrorPanel";
import {Switch, Route, Link, useLocation} from "react-router-dom";
import InstrumentList from "./Components/InstrumentList";
import {Instrument} from "../Interfaces";
import {ErrorBoundary} from "./Components/ErrorHandling/ErrorBoundary";
import UploadPage from "./Components/UploadPage/UploadPage";
import DeploymentSummary from "./Components/DeploymentSummary";
import {ONSPanel} from "./Components/ONSDesignSystem/ONSPanel";
import DeleteConfirmation from "./Components/DeleteConfirmation";
import NotProductionWarning from "./Components/ONSDesignSystem/NotProductionWarning";
import InstrumentDetails from "./Components/InstrumentDetails";

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
        getInstrumentList();
    }, []);

    function getInstrumentList() {
        setInstruments([]);
        fetch("/api/instruments")
            .then((r: Response) => {
                if (r.status === 404) {
                    setListError("No installed questionnaires found.");
                    return;
                }
                if (r.status !== 200) {
                    throw r.status + " - " + r.statusText;
                }
                r.json()
                    .then((json: Instrument[]) => {
                        if (!Array.isArray(json)) {
                            throw "Json response is not a list";
                        }
                        console.log("Retrieved instrument list, " + json.length + " items/s");
                        console.log(json);
                        setInstruments(json);

                        // If the list is empty then show this message in the list
                        if (json.length === 0) setListError("No installed questionnaires found.");
                    })
                    .catch((error) => {
                        console.error("Unable to read json from response, error: " + error);
                        setListError("Unable to load questionnaires");
                    });
            }).catch((error) => {
                console.error("Failed to retrieve instrument list, error: " + error);
                setListError("Unable to load questionnaires");
            }
        );
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
                            <Route path="/UploadSummary">
                                <DeploymentSummary getList={getInstrumentList}/>
                            </Route>
                            <Route path="/questionnaire">
                                <InstrumentDetails/>
                            </Route>
                            <Route path="/upload">
                                <UploadPage/>
                            </Route>
                            <Route path="/delete">
                                <DeleteConfirmation  getList={getInstrumentList}/>
                            </Route>
                            <Route path="/">

                                {status !== "" && <ONSPanel status="success">{status}</ONSPanel>}
                                {listError.includes("Unable") && <ONSErrorPanel/>}

                                <p className="u-mt-m">
                                    <Link to="/upload" id="deploy-questionnaire-link">
                                        Deploy a questionnaire
                                    </Link>
                                </p>

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
