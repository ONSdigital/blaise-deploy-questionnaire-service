import React, { ReactElement, useEffect, useState } from "react";
import { Route, Switch, useHistory, useLocation, Link } from "react-router-dom";
import QuestionnaireList from "./components/questionnaireList";
import UploadPage from "./components/uploadPage/uploadPage";
import DeploymentSummary from "./components/deploymentSummary";
import DeleteConfirmation from "./components/deletePage/deleteConfirmation";
import StatusPage from "./components/statusPage";
import {
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
import ReinstallQuestionnaires from "./components/reinstallQuestionnaires";
import LiveSurveyWarning from "./components/uploadPage/liveSurveyWarning";
import QuestionnaireDetails from "./components/questionnaireDetailsPage/questionnaireDetails";
import ChangeTOStartDate from "./components/questionnaireDetailsPage/changeTOStartDate";
import ChangeTMReleaseDate from "./components/questionnaireDetailsPage/changeTmReleaseDate";
import "./style.css";
import { isProduction } from "./client/env";
import { LoginForm, AuthManager } from "blaise-login-react-client";
import "./style.css";

const divStyle = {
    minHeight: "calc(67vh)"
};

function App(): ReactElement {
    const location = useLocation();
    const history = useHistory();

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

    function onDeleteQuestionnaire(status: string): void {
        history.push("/");
        setStatus(status);
    }

    function onCancelDeleteQuestionnaire(): void {
        history.goBack();
    }

    function AppContent(): ReactElement {
        if (!loaded || !loggedIn) {
            return <></>;
        }

        return (
            <>
                <DefaultErrorBoundary>
                    <Switch>
                        <Route path="/status">
                            <StatusPage/>
                        </Route>
                        <Route path="/reinstall">
                            <ReinstallQuestionnaires/>
                        </Route>
                        <Route path="/audit">
                            <AuditPage/>
                        </Route>
                        <Route path="/UploadSummary">
                            <DeploymentSummary/>
                        </Route>
                        <Route path="/upload/survey-live/:questionnaireName">
                            <LiveSurveyWarning/>
                        </Route>
                        <Route path="/questionnaire/start-date">
                            <ChangeTOStartDate/>
                        </Route>
                        <Route path="/questionnaire/release-date">
                            <ChangeTMReleaseDate/>
                        </Route>
                        <Route path="/questionnaire/:questionnaireName">
                            <QuestionnaireDetails/>
                        </Route>
                        <Route path="/upload">
                            <UploadPage/>
                        </Route>
                        <Route path="/delete">
                            <DeleteConfirmation onDelete={onDeleteQuestionnaire} onCancel={onCancelDeleteQuestionnaire} />
                        </Route>
                        <Route path="/">
                            <main id="main-content" className="ons-page__main ons-u-mt-no">
                                {successBanner()}
                                {errored && <ONSErrorPanel/>}
                                <ErrorBoundary
                                    errorMessageText={"Unable to load questionnaire table correctly"}>
                                    <QuestionnaireList setErrored={setErrored}/>
                                </ErrorBoundary>
                            </main>
                        </Route>
                    </Switch>
                </DefaultErrorBoundary>
            </>
        );
    }

    return (
        <>
            <a className="ons-skip-link" href="#main-content">Skip to content</a>
            {
                isProduction(window.location.hostname) ? <></> : <NotProductionWarning />
            }
            <Header 
                title={"Deploy Questionnaire Service"} 
                signOutButton={loggedIn} 
                noSave={true} 
                signOutFunction={signOut}
                navigationLinks={[
                    { id: "home-link", label: "Home", endpoint: "/" },
                    { id: "deploy-questionnaire-link", label: "Deploy a questionnaire", endpoint: "/upload" },
                    { id: "audit-logs-link", label: "View deployment history", endpoint: "/audit" },
                    { id: "blaise-status-link", label: "Check Blaise status", endpoint: "/status" },
                ]}
                currentLocation={location.pathname}
                createNavLink={(id: string, label: string, endpoint: string) => (
                    <Link to={endpoint} id={id} className="ons-navigation__link">
                        {label}
                    </Link>
                )}    
            />
            <div style={divStyle} className="ons-page__container ons-container">
                <Loading />
                <LoginPage />
                <AppContent />
            </div>
            <Footer />
        </>
    );
}

export default App;
