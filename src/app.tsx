import React, { ReactElement, useEffect, useState } from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import InstrumentList from "./components/instrumentList";
import UploadPage from "./components/uploadPage/uploadPage";
import DeploymentSummary from "./components/deploymentSummary";
import DeleteConfirmation from "./components/deletePage/deleteConfirmation";
import StatusPage from "./components/statusPage";
import {
    BetaBanner,
    DefaultErrorBoundary,
    ErrorBoundary,
    Footer,
    Header,
    NotProductionWarning,
    ONSPanel,
    ONSLoadingPanel,
    ONSErrorPanel
} from "blaise-design-system-react-components";
import AuditPage from "./components/auditPage";
import ReinstallInstruments from "./components/reinstallInstruments";
import LiveSurveyWarning from "./components/uploadPage/liveSurveyWarning";
import InstrumentDetails from "./components/instrumentDetails/instrumentDetails";
import ChangeToStartDate from "./components/instrumentDetails/changeToStartDate";
import "./style.css";
import { NavigationLinks } from "./components/navigationLinks";
import { isProduction } from "./utilities/env";
import { LoginForm, AuthManager } from "blaise-login-react-client";
import "./style.css";


const divStyle = {
    minHeight: "calc(67vh)"
};


function App(): ReactElement {
    const location = useLocation();

    const authManager = new AuthManager();

    const [loaded, setLoaded] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [errored, setErrored] = useState(false);
    const [status, setStatus] = useState("");

    useEffect(() => {
        console.log(location);
        authManager.loggedIn().then((isLoggedIn: boolean) => {
            setLoggedIn(isLoggedIn);
            setLoaded(true);
        });
    }, []);

    function LoginPage(): ReactElement {
        if (loaded && loggedIn) {
            return <></>;
        }
        return <LoginForm authManager={authManager} setLoggedIn={setLoggedIn} />;
    }

    function Loading(): ReactElement {
        if (loaded) {
            return <></>;
        }
        return <ONSLoadingPanel />;
    }

    function signOut(): void {
        authManager.clearToken();
        setLoggedIn(false);
    }

    function successBanner(): ReactElement {
        if (status !== "") {
            return <ONSPanel status="success">{status}</ONSPanel>;
        }
        return <></>;
    }

    function AppContent(): ReactElement {
        if (loaded && loggedIn) {
            return (
                <DefaultErrorBoundary>
                    <Switch>
                        <Route path="/status">
                            <StatusPage />
                        </Route>
                        <Route path="/reinstall">
                            <ReinstallInstruments />
                        </Route>
                        <Route path="/audit">
                            <AuditPage />
                        </Route>
                        <Route path="/UploadSummary">
                            <DeploymentSummary />
                        </Route>
                        <Route path={"/upload/survey-live/:instrumentName"}>
                            <LiveSurveyWarning />
                        </Route>
                        <Route path="/questionnaire/start-date">
                            <ChangeToStartDate />
                        </Route>
                        <Route path="/questionnaire">
                            <InstrumentDetails />
                        </Route>
                        <Route path="/upload">
                            <UploadPage />
                        </Route>
                        <Route path="/delete">
                            <DeleteConfirmation setStatus={setStatus} />
                        </Route>
                        <Route path="/">
                            <main id="main-content" className="page__main u-mt-no">
                                {successBanner()}
                                {errored && <ONSErrorPanel />}

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
                                    <InstrumentList setErrored={setErrored} />
                                </ErrorBoundary>
                            </main>
                        </Route>
                    </Switch>
                </DefaultErrorBoundary>);
        }
        return <></>;
    }

    return (
        <>
            <a className="skip__link" href="#main-content">Skip to content</a>
            {
                isProduction(window.location.hostname) ? <></> : <NotProductionWarning />
            }
            <BetaBanner />
            <Header title={"Deploy Questionnaire Service"} signOutButton={loggedIn} noSave={true} signOutFunction={signOut} />
            <NavigationLinks />
            <div style={divStyle} className="page__container container">
                <Loading />
                <LoginPage />
                <AppContent />

            </div>
            <Footer />
        </>
    );
}

export default App;
