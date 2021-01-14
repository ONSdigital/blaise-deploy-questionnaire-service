import React, {ReactElement, useEffect, useState} from "react";
import Header from "./Components/ONSDesignSystem/Header";
import BetaBanner from "./Components/ONSDesignSystem/BetaBanner";
import {DefaultErrorBoundary} from "./Components/ErrorHandling/DefaultErrorBoundary";
import Footer from "./Components/ONSDesignSystem/Footer";
import ONSErrorPanel from "./Components/ONSDesignSystem/ONSErrorPanel";
import {isDevEnv} from "./Functions";
import {
    Switch,
    Route, Link,

} from "react-router-dom";
import InstrumentList from "./Components/InstrumentList";
import SurveyList from "./Components/SurveyList";
import {Survey} from "../Interfaces";
import {ErrorBoundary} from "./Components/ErrorHandling/ErrorBoundary";
import UploadPage from "./Components/UploadPage";
import DeploymentSummary from "./Components/DeploymentSummary";
import {ONSPanel} from "./Components/ONSDesignSystem/ONSPanel";


interface listError {
    error: boolean,
    message: string
}

interface window extends Window {
    VM_EXTERNAL_CLIENT_URL: string
    CATI_DASHBOARD_URL: string
}

const divStyle = {
    minHeight: "calc(67vh)"
};

function App(): ReactElement {

    const [externalClientUrl, setExternalClientUrl] = useState<string>("External URL should be here");
    const [externalCATIUrl, setExternalCATIUrl] = useState<string>("/Blaise");


    useEffect(function retrieveVariables() {
        setExternalClientUrl(isDevEnv() ?
            process.env.REACT_APP_VM_EXTERNAL_CLIENT_URL || externalClientUrl : (window as unknown as window).VM_EXTERNAL_CLIENT_URL);
        setExternalCATIUrl(isDevEnv() ?
            process.env.REACT_APP_CATI_DASHBOARD_URL || externalCATIUrl : (window as unknown as window).CATI_DASHBOARD_URL);
    }, [externalClientUrl, externalCATIUrl]);

    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [listError, setListError] = useState<listError>({error: false, message: "Loading ..."});

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
                    .then((json: Survey[]) => {
                        if (!Array.isArray(json)) {
                            throw "Json response is not a list";
                        }
                        console.log("Retrieved instrument list, " + json.length + " items/s");
                        isDevEnv() && console.log(json);
                        setSurveys(json);
                        setListError({error: false, message: ""});

                        // If the list is empty then show this message in the list
                        if (json.length === 0) setListError({error: false, message: "No active surveys found."});
                    })
                    .catch((error) => {
                        isDevEnv() && console.error("Unable to read json from response, error: " + error);
                        setListError({error: true, message: "Unable to load surveys"});
                    });
            }).catch((error) => {
                isDevEnv() && console.error("Failed to retrieve instrument list, error: " + error);
                setListError({error: true, message: "Unable to load surveys"});
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
                                <DeploymentSummary/>
                            </Route>
                            <Route path="/upload">
                                <UploadPage/>
                            </Route>
                            <Route path="/survey/:survey">
                                <ErrorBoundary errorMessageText={"Unable to load questionnaire table correctly"}>
                                    <InstrumentList list={surveys} listError={listError}/>
                                </ErrorBoundary>
                            </Route>
                            <Route path="/">

                                {listError.error && <ONSErrorPanel/>}

                                <Link to="/upload" id="deploy-questionnaire-link">
                                    Deploy a questionnaire
                                </Link>
                                <ONSPanel>
                                    <p>
                                        Any <b>live</b> questionnaire within the table below <b>does not</b> have the
                                        option to delete and <b>cannot be deleted</b>.

                                        If a <b>live</b> questionnaire requires deletion, raise a Service Desk ticket to
                                        complete this request.
                                    </p>
                                </ONSPanel>

                                <ErrorBoundary errorMessageText={"Unable to load survey table correctly"}>
                                    <SurveyList list={surveys} listError={listError}/>
                                </ErrorBoundary>
                            </Route>
                        </Switch>
                    </DefaultErrorBoundary>
                </main>
            </div>
            <Footer external_client_url={externalClientUrl}/>
        </>
    );
}

export default App;
