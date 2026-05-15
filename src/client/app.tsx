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
import { AuthClient, LoginForm } from "blaise-login-react-client";
import {
  lazy,
  type ReactElement,
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import QuestionnairesPage from "./components/questionnairesPage/questionnairesPage";
import { isProduction } from "./utils/env";

const AuditPage = lazy(() => import("./components/auditPage/auditPage"));
const CreateDonorCasesPage = lazy(
  () => import("./components/createDonorCasesPage/createDonorCasesPage"),
);
const DeleteQuestionnairePage = lazy(
  () => import("./components/deleteQuestionnairePage/deleteQuestionnairePage"),
);
const QuestionnaireTmReleaseDatePage = lazy(
  () => import("./components/questionnaireTmReleaseDatePage/questionnaireTmReleaseDatePage"),
);
const QuestionnaireToStartDatePage = lazy(
  () => import("./components/questionnaireToStartDatePage/questionnaireToStartDatePage"),
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

function NotFound(): ReactElement {
  return (
    <main
      id="main-content"
      className="ons-page__main ons-u-mt-l"
    >
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/">Return to home</Link>
    </main>
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
      <Suspense
        fallback={
          <main
            id="main-content"
            className="ons-page__main ons-u-mt-l"
          >
            <LoadingPanel />
          </main>
        }
      >
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
            element={<QuestionnaireTmReleaseDatePage />}
          />
          <Route
            path="/questionnaire/:questionnaireName/reissue-new-donor-case/:user"
            element={<ReissueNewDonorCasePage />}
          />
          <Route
            path="/questionnaire/:questionnaireName/start-date"
            element={<QuestionnaireToStartDatePage />}
          />
          <Route
            path="/reinstall"
            element={<ReinstallQuestionnaires />}
          />
          <Route
            path="*"
            element={<NotFound />}
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

  const authClient = useMemo(() => new AuthClient(), []);
  const [authState, setAuthState] = useState<"checking" | "unauthenticated" | "authenticated">(
    "checking",
  );

  const handleSetLoggedIn = useCallback((loggedIn: boolean) => {
    setAuthState(loggedIn ? "authenticated" : "unauthenticated");
  }, []);

  const handleLogOut = useCallback(() => {
    authClient.logOut(handleSetLoggedIn);
  }, [authClient, handleSetLoggedIn]);

  useEffect(() => {
    void authClient.loggedIn().then(handleSetLoggedIn);
  }, [authClient, handleSetLoggedIn]);

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
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <a
        href="#main-content"
        className="ons-skip-to-content ons-u-fs-r--b"
      >
        Skip to content
      </a>
      {!isProduction(window.location.hostname) && <NotProductionWarning />}
      <Header
        title="Deploy Questionnaire Service"
        signOutButton={authState === "authenticated"}
        noSave={true}
        signOutFunction={handleLogOut}
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
        style={{ flexGrow: 1 }}
        className="ons-page__container ons-container"
      >
        {authState === "checking" && (
          <main
            id="main-content"
            className="ons-page__main ons-u-mt-l"
          >
            <LoadingPanel />
          </main>
        )}
        {authState === "unauthenticated" && (
          <main
            id="main-content"
            className="ons-page__main ons-u-mt-l"
          >
            <Panel status="info">Enter your Blaise username and password</Panel>
            <LoginForm
              authManager={authClient}
              setLoggedIn={handleSetLoggedIn}
            />
          </main>
        )}
        {authState === "authenticated" && (
          <AppRoutes
            errored={errored}
            setErrored={setErrored}
            status={visibleStatus}
            onDeleteQuestionnaire={onDeleteQuestionnaire}
            onCancelDeleteQuestionnaire={onCancelDeleteQuestionnaire}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}

export default App;
