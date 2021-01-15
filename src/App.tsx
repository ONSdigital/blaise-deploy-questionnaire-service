import React, {ReactElement, useEffect, useState} from "react";
import Header from "./Components/ONSDesignSystem/Header";
import BetaBanner from "./Components/ONSDesignSystem/BetaBanner";
import {DefaultErrorBoundary} from "./Components/ErrorHandling/DefaultErrorBoundary";
import Footer from "./Components/ONSDesignSystem/Footer";
import ONSErrorPanel from "./Components/ONSDesignSystem/ONSErrorPanel";
import {isDevEnv} from "./Functions";
import {Switch, Route, Link} from "react-router-dom";
import InstrumentList from "./Components/InstrumentList";
import {Instrument} from "../Interfaces";
import {ErrorBoundary} from "./Components/ErrorHandling/ErrorBoundary";
import UploadPage from "./Components/UploadPage/UploadPage";
import DeploymentSummary from "./Components/DeploymentSummary";
import {ONSPanel} from "./Components/ONSDesignSystem/ONSPanel";

const divStyle = {
    minHeight: "calc(67vh)"
};

function App(): ReactElement {
    const [surveys, setSurveys] = useState<Instrument[]>([]);
    const [listError, setListError] = useState<string>("Loading ...");

    useEffect(() => {
        getList();
    }, []);

    function getList() {
        fetch("/api/instruments")
            .then((r: Response) => {
                if (r.status !== 200) {
                    throw r.status + " - " + r.statusText;
                }
                r.json()
                    .then((json: Instrument[]) => {
                        if (!Array.isArray(json)) {
                            throw "Json response is not a list";
                        }
                        console.log("Retrieved instrument list, " + json.length + " items/s");
                        isDevEnv() && console.log(json);
                        setSurveys(json);
                        setListError("");

                        // If the list is empty then show this message in the list
                        if (json.length === 0) setListError("No active surveys found.");
                    })
                    .catch((error) => {
                        isDevEnv() && console.error("Unable to read json from response, error: " + error);
                        setListError("Unable to load surveys");
                    });
            }).catch((error) => {
                isDevEnv() && console.error("Failed to retrieve instrument list, error: " + error);
                setListError("Unable to load surveys");
            }
        );
    }


    return (
        <>
            <BetaBanner/>
            <Header title={"Deploy Questionnaire Service"}/>
            <div style={divStyle} className="page__container container">
                <main id="main-content" className="page__main">
                    <DefaultErrorBoundary>

                        <Switch>
                            <Route path="/UploadSummary">
                                <DeploymentSummary getList={getList}/>
                            </Route>
                            <Route path="/upload">
                                <UploadPage/>
                            </Route>
                            <Route path="/">

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
                                    <InstrumentList list={surveys} listError={listError}/>
                                </ErrorBoundary>
                            </Route>
                        </Switch>
                    </DefaultErrorBoundary>
                </main>
            </div>
            <Footer external_client_url={""}/>
        </>
    );
}

export default App;
