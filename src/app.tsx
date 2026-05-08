import type { User } from "blaise-api-node-client";
import {
  DefaultErrorBoundary,
  ErrorBoundary,
  ErrorPanel,
  Footer,
  Header,
  LoadingPanel,
  NotProductionWarning,
  Panel,
} from "blaise-design-system-react-components";
import { Authenticate } from "blaise-login-react-client";
import { Suspense, lazy, type ReactElement, type ReactNode, useEffect, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { isProduction } from "./client/env";
import QuestionnaireList from "./components/questionnaireList";
import "./style.css";

const AuditPage = lazy(() => import("./components/auditPage"));
const CreateDonorCasesConfirmation = lazy(
  () => import("./components/createDonorCasePage/createDonorCasesConfirmation"),
);
const DeleteConfirmation = lazy(() => import("./components/deletePage/deleteConfirmation"));
const DeploymentSummary = lazy(() => import("./components/deploymentSummary"));
const ChangeTmReleaseDate = lazy(
  () => import("./components/questionnaireDetailsPage/changeTmReleaseDate"),
);
const ChangeToStartDate = lazy(
  () => import("./components/questionnaireDetailsPage/changeToStartDate"),
);
const QuestionnaireDetailsPage = lazy(
  () => import("./components/questionnaireDetailsPage/questionnaireDetailsPage"),
);
const ReinstallQuestionnaires = lazy(() => import("./components/reinstallQuestionnaires"));
const ReissueNewDonorCaseConfirmation = lazy(
  () => import("./components/reissueNewDonorCasePage/reissueNewDonorCaseConfirmation"),
);
const StatusPage = lazy(() => import("./components/statusPage"));
const LiveSurveyWarning = lazy(() => import("./components/uploadPage/liveSurveyWarning"));
const UploadPage = lazy(() => import("./components/uploadPage/uploadPage"));

const divStyle = {
  minHeight: "calc(67vh)",
};

type AppRoutesProps = {
  errored: boolean;
  setErrored: (errored: boolean) => void;
  status: string;
  onDeleteQuestionnaire: (status: string) => void;
  onCancelDeleteQuestionnaire: () => void;
};

function createNavLink(id: string | undefined, label: string, endpoint: string): ReactNode {
  return (
    <Link
      to={endpoint}
      id={id}
      className="ons-navigation__link"
    >
      {label}
    </Link>
  );
}

function AppRoutes({
  errored,
  setErrored,
  status,
  onDeleteQuestionnaire,
  onCancelDeleteQuestionnaire,
}: AppRoutesProps): ReactElement {
  return (
    <DefaultErrorBoundary>
      <Suspense fallback={<LoadingPanel />}>
        <Routes>
          <Route
            path="/status"
            element={<StatusPage />}
          />
          <Route
            path="/reinstall"
            element={<ReinstallQuestionnaires />}
          />
          <Route
            path="/audit"
            element={<AuditPage />}
          />
          <Route
            path="/UploadSummary"
            element={<DeploymentSummary />}
          />
          <Route
            path="/upload/survey-live/:questionnaireName"
            element={<LiveSurveyWarning />}
          />
          <Route
            path="/questionnaire/start-date"
            element={<ChangeToStartDate />}
          />
          <Route
            path="/questionnaire/release-date"
            element={<ChangeTmReleaseDate />}
          />
          <Route
            path="/questionnaire/:questionnaireName"
            element={<QuestionnaireDetailsPage />}
          />
          <Route
            path="/upload"
            element={<UploadPage />}
          />
          <Route
            path="/delete"
            element={
              <DeleteConfirmation
                onDelete={onDeleteQuestionnaire}
                onCancel={onCancelDeleteQuestionnaire}
              />
            }
          />
          <Route
            path="/createDonorCasesConfirmation"
            element={<CreateDonorCasesConfirmation />}
          />
          <Route
            path="/reissueNewDonorCaseConfirmation"
            element={<ReissueNewDonorCaseConfirmation />}
          />
          <Route
            path="/"
            element={
              <main
                id="main-content"
                className="ons-page__main ons-u-mt-no"
              >
                {status !== "" && <Panel status="success">{status}</Panel>}
                {errored && <ErrorPanel />}
                <ErrorBoundary errorMessageText="Unable to load questionnaire table correctly">
                  <QuestionnaireList setErrored={setErrored} />
                </ErrorBoundary>
              </main>
            }
          />
        </Routes>
      </Suspense>
    </DefaultErrorBoundary>
  );
}

function App(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();

  const [errored, setErrored] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (location.pathname !== "/" && status !== "") {
      setStatus("");
    }
  }, [location.pathname, status]);

  useEffect(() => {
    if (status === "") {
      return;
    }

    const timer = window.setTimeout(() => {
      setStatus("");
    }, 5000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [status]);

  function onDeleteQuestionnaire(newStatus: string): void {
    navigate("/");
    setStatus(newStatus);
  }

  function onCancelDeleteQuestionnaire(): void {
    navigate(-1);
  }

  return (
    <Authenticate title="Deploy Questionnaire Service">
      {(_user: User, loggedIn: boolean, logOutFunction: () => void) => (
        <>
          <a
            href="#main-content"
            className="ons-skip-to-content ons-u-fs-r--b"
          >
            Skip to content
          </a>
          {!isProduction(window.location.hostname) && <NotProductionWarning />}
          <Header
            title="Deploy Questionnaire Service"
            signOutButton={loggedIn}
            noSave={true}
            signOutFunction={logOutFunction}
            navigationLinks={[
              { id: "home-link", label: "Home", endpoint: "/" },
              {
                id: "deploy-questionnaire-link",
                label: "Deploy a questionnaire",
                endpoint: "/upload",
              },
              { id: "audit-logs-link", label: "View deployment history", endpoint: "/audit" },
              { id: "blaise-status-link", label: "Check Blaise status", endpoint: "/status" },
            ]}
            currentLocation={location.pathname}
            createNavLink={createNavLink}
          />
          <div
            style={divStyle}
            className="ons-page__container ons-container"
          >
            <AppRoutes
              errored={errored}
              setErrored={setErrored}
              status={status}
              onDeleteQuestionnaire={onDeleteQuestionnaire}
              onCancelDeleteQuestionnaire={onCancelDeleteQuestionnaire}
            />
          </div>
          <Footer />
        </>
      )}
    </Authenticate>
  );
}

export default App;
