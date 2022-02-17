import React, { ReactElement, useEffect, useState } from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import InstrumentList from "./Components/InstrumentList";
import { Instrument } from "../Interfaces";
import UploadPage from "./Components/UploadPage/UploadPage";
import DeploymentSummary from "./Components/DeploymentSummary";
import DeleteConfirmation from "./Components/DeletePage/DeleteConfirmation";
import StatusPage from "./Components/StatusPage";
import {
    BetaBanner,
    DefaultErrorBoundary,
    ErrorBoundary,
    Footer,
    Header,
    NotProductionWarning,
    ONSErrorPanel,
    ONSPanel
} from "blaise-design-system-react-components";
import { getAllInstruments } from "./utilities/http";
import AuditPage from "./Components/AuditPage";
import ReinstallInstruments from "./Components/ReinstallInstruments";
import LiveSurveyWarning from "./Components/UploadPage/LiveSurveyWarning";
import InstrumentDetails from "./Components/InstrumentDetails/InstrumentDetails";
import ChangeToStartDate from "./Components/InstrumentDetails/ChangeToStartDate";
import "./style.css";
import { NavigationLinks } from "./Components/NavigationLinks";
import { isProduction } from "./utilities/env";
import { LoginForm, AuthManager } from "blaise-login-react-client";
import "./style.css";


const divStyle = {
    minHeight: "calc(67vh)"
};

interface Location {
    state: any;
}

function App(): ReactElement {
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const [listLoading, setListLoading] = useState<boolean>(true);
    const [listMessage, setListMessage] = useState<string>("");

    const location = useLocation();
    const { status } = (location as Location).state || { status: "" };

    const authManager = new AuthManager();

    const [loaded, setLoaded] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        authManager.loggedIn()
            .then(async (isLoggedIn: boolean) => {
                setLoggedIn(isLoggedIn);
                setLoaded(true);
                if (isLoggedIn) {
                    await getInstrumentList();
                    console.log("getInstrumentList complete");
                }
            });
    }, []);

    function loginPage(): ReactElement {
        if (loaded && loggedIn) {
          return <></>;
        }
        return <LoginForm authManager={authManager} setLoggedIn={setLoggedIn} />;
      }

    function signOut(): void {
        authManager.clearToken();
        setLoggedIn(false);
      }


    async function getInstrumentList() {
        setListLoading(true);
        setInstruments([]);

        const [success, instrumentList] = await getAllInstruments();
        console.log(`Response from get all instruments ${(status ? "successful" : "failed")}, data list length ${instrumentList.length}`);
        console.log(instrumentList);

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

    function appContent(): ReactElement {
        if (loaded && loggedIn) {
            return (
                <DefaultErrorBoundary>
                    <Switch>
                        <Route path="/status">
                            <StatusPage />
                        </Route>
                        <Route path="/reinstall">
                            <ReinstallInstruments installedInstruments={instruments} listLoading={listLoading} />
                        </Route>
                        <Route path="/audit">
                            <AuditPage />
                        </Route>
                        <Route path="/UploadSummary">
                            <DeploymentSummary getList={getInstrumentList} />
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
                            <DeleteConfirmation getList={getInstrumentList} />
                        </Route>
                        <Route path="/">
                            <main id="main-content" className="page__main u-mt-no">

                                {status !== "" && <ONSPanel status="success">{status}</ONSPanel>}
                                {listMessage.includes("Unable") && <ONSErrorPanel />}

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
                                    <InstrumentList instrumentList={instruments} listMessage={listMessage}
                                        loading={listLoading} />
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
            <Header title={"Deploy Questionnaire Service"} signOutButton={loggedIn} noSave={true} signOutFunction={signOut}/>
            <NavigationLinks />
            <div style={divStyle} className="page__container container">
                {loginPage()}
                {appContent()}

            </div>
            <Footer />
        </>
    );
}

export default App;
