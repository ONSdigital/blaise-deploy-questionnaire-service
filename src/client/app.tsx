import { useQueryClient } from "@tanstack/react-query";
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
import { lazy, type ReactElement, type ReactNode, Suspense, useEffect, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import QuestionnairesPage from "./components/questionnairesPage/questionnairesPage";
import { isProduction } from "./utils/env";

import type { User } from "blaise-api-node-client";

const AuditPage = lazy(() => import("./components/auditPage/auditPage"));
const CreateDonorCasesPage = lazy(
  () => import("./components/createDonorCasesPage/createDonorCasesPage"),
);
const DeleteQuestionnairePage = lazy(
  () => import("./components/deleteQuestionnairePage/deleteQuestionnairePage"),
);
const QuestionnaireReleaseDatePage = lazy(
  () => import("./components/questionnaireReleaseDatePage/questionnaireReleaseDatePage"),
);
const QuestionnaireStartDatePage = lazy(
  () => import("./components/questionnaireStartDatePage/questionnaireStartDatePage"),
);
const QuestionnaireDetailsPage = lazy(
  () => import("./components/questionnaireDetailsPage/questionnaireDetailsPage"),
);
const ReinstallQuestionnaires = lazy(
  () => import("./components/reinstallQuestionnairesPage/reinstallQuestionnairesPage"),
);
const ReissueNewDonorCasePage = lazy(
  () => import("./components/reissueNewDonorCasePage/reissueNewDonorCasePage"),
);
const DeployPage = lazy(
  () => import("./components/deployQuestionnairePage/deployQuestionnairePage"),
);

const divStyle = {
  minHeight: "calc(67vh)",
};

type AppRoutesProps = {
  errored: boolean;
  setErrored: (errored: boolean) => void;
  status: string;
  onDeleteQuestionnaire: (status: string) => void;
  onCancelDeleteQuestionnaire: (questionnaireName: string) => void;
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
            path="/"
            element={
              <main
                id="main-content"
                className="ons-page__main ons-u-mt-no"
              >
                {status !== "" && <Panel status="success">{status}</Panel>}
                {errored && <ErrorPanel />}
                <ErrorBoundary errorMessageText="Unable to load questionnaires">
                  <QuestionnairesPage setErrored={setErrored} />
                </ErrorBoundary>
              </main>
            }
          />
          <Route
            path="/audit"
            element={<AuditPage />}
          />
          <Route
            path="/deploy"
            element={<DeployPage />}
          />
          <Route
            path="/questionnaire/:questionnaireName"
            element={<QuestionnaireDetailsPage />}
          />
          <Route
            path="/questionnaire/:questionnaireName/create-donor-cases/:role"
            element={<CreateDonorCasesPage />}
          />
          <Route
            path="/questionnaire/:questionnaireName/delete"
            element={
              <DeleteQuestionnairePage
                onDelete={onDeleteQuestionnaire}
                onCancel={onCancelDeleteQuestionnaire}
              />
            }
          />
          <Route
            path="/questionnaire/:questionnaireName/release-date"
            element={<QuestionnaireReleaseDatePage />}
          />
          <Route
            path="/questionnaire/:questionnaireName/reissue-new-donor-case/:user"
            element={<ReissueNewDonorCasePage />}
          />
          <Route
            path="/questionnaire/:questionnaireName/start-date"
            element={<QuestionnaireStartDatePage />}
          />
          <Route
            path="/reinstall"
            element={<ReinstallQuestionnaires />}
          />
        </Routes>
      </Suspense>
    </DefaultErrorBoundary>
  );
}

function App(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [errored, setErrored] = useState(false);
  const [status, setStatus] = useState("");
  const visibleStatus = location.pathname === "/" ? status : "";

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
    void queryClient.invalidateQueries({ queryKey: ["questionnaires"] });
    navigate("/");
    setStatus(newStatus);
  }

  function onCancelDeleteQuestionnaire(questionnaireName: string): void {
    navigate(`/questionnaire/${questionnaireName}`);
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
                label: "Deploy questionnaire",
                endpoint: "/deploy",
              },
              { id: "audit-logs-link", label: "View deployment history", endpoint: "/audit" },
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
              status={visibleStatus}
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
