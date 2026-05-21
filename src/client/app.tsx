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
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { AUTH_EXPIRED_EVENT_NAME } from "./api/axiosConfig";
import QuestionnairesPage from "./pages/questionnairesPage/questionnairesPage";
import { getSharedAuthOptions } from "./utils/auth";
import { isProduction } from "./utils/env";
import { readStateString } from "./utils/locationState";

const AuditPage = lazy(() => import("./pages/auditPage/auditPage"));
const CreateDonorCasesPage = lazy(
  () => import("./pages/createDonorCasesPage/createDonorCasesPage"),
);
const DeleteQuestionnairePage = lazy(
  () => import("./pages/deleteQuestionnairePage/deleteQuestionnairePage"),
);
const QuestionnaireTmReleaseDatePage = lazy(
  () => import("./pages/questionnaireTmReleaseDatePage/questionnaireTmReleaseDatePage"),
);
const QuestionnaireToStartDatePage = lazy(
  () => import("./pages/questionnaireToStartDatePage/questionnaireToStartDatePage"),
);
const QuestionnaireDetailsPage = lazy(
  () => import("./pages/questionnaireDetailsPage/questionnaireDetailsPage"),
);
const ReinstallQuestionnaires = lazy(
  () => import("./pages/reinstallQuestionnairesPage/reinstallQuestionnairesPage"),
);
const ReissueNewDonorCasePage = lazy(
  () => import("./pages/reissueNewDonorCasePage/reissueNewDonorCasePage"),
);
const DeployPage = lazy(() => import("./pages/deployQuestionnairePage/deployQuestionnairePage"));

type AppRoutesProps = {
  errored: boolean;
  setErrored: (errored: boolean) => void;
  deletedQuestionnaireName: string;
  onDeleteQuestionnaire: (questionnaireName: string) => void;
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
      <Link to="/">Return home</Link>
    </main>
  );
}

function DeleteQuestionnaireSummary({
  questionnaireName,
}: {
  questionnaireName: string;
}): ReactElement {
  return (
    <div className="ons-u-mb-m">
      <Panel
        status="success"
        bigIcon={true}
      >
        <h1>Questionnaire {questionnaireName} deleted successfully</h1>
      </Panel>
    </div>
  );
}

function AppRoutes({
  errored,
  setErrored,
  deletedQuestionnaireName,
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
                {deletedQuestionnaireName !== "" && (
                  <DeleteQuestionnaireSummary questionnaireName={deletedQuestionnaireName} />
                )}
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
            path="/questionnaire/:questionnaireName/tm-release-date"
            element={<QuestionnaireTmReleaseDatePage />}
          />
          <Route
            path="/questionnaire/:questionnaireName/reissue-new-donor-case/:user"
            element={<ReissueNewDonorCasePage />}
          />
          <Route
            path="/questionnaire/:questionnaireName/to-start-date"
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

  const [authClient] = useState(() => new AuthClient(getSharedAuthOptions()));
  const [authState, setAuthState] = useState<"checking" | "unauthenticated" | "authenticated">(
    () => (authClient.getToken() == null ? "unauthenticated" : "checking"),
  );
  const [errored, setErrored] = useState(false);

  const updateAuthStateEffect = useEffectEvent((loggedIn: boolean) => {
    setAuthState(loggedIn ? "authenticated" : "unauthenticated");
  });

  function clearSession(): void {
    authClient.logOut();
    queryClient.clear();
    setErrored(false);
    setAuthState("unauthenticated");
  }

  const clearSessionEffect = useEffectEvent(clearSession);

  async function handleAuthenticated(token: string): Promise<void> {
    authClient.setToken(token);

    try {
      setAuthState((await authClient.loggedIn()) ? "authenticated" : "unauthenticated");
    } catch {
      clearSession();
    }
  }

  useEffect(() => {
    if (authClient.getToken() == null) {
      return;
    }

    void authClient
      .loggedIn()
      .then((loggedIn) => {
        updateAuthStateEffect(loggedIn);
      })
      .catch(() => {
        updateAuthStateEffect(false);
      });
  }, [authClient]);

  useEffect(() => {
    const onAuthExpired = () => {
      clearSessionEffect();
    };

    window.addEventListener(AUTH_EXPIRED_EVENT_NAME, onAuthExpired);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT_NAME, onAuthExpired);
    };
  }, []);

  const deletedQuestionnaireName =
    location.pathname === "/"
      ? (readStateString(location.state, "deletedQuestionnaireName") ?? "")
      : "";

  function onDeleteQuestionnaire(questionnaireName: string): void {
    void queryClient.invalidateQueries({ queryKey: ["questionnaires"] });
    navigate("/", { state: { deletedQuestionnaireName: questionnaireName } });
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
        signOutFunction={clearSession}
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
            <LoginForm onAuthenticated={handleAuthenticated} />
          </main>
        )}
        {authState === "authenticated" && (
          <AppRoutes
            errored={errored}
            setErrored={setErrored}
            deletedQuestionnaireName={deletedQuestionnaireName}
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
