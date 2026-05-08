import type { Questionnaire } from "blaise-api-node-client";
import { Button, ErrorBoundary, LoadingPanel, Panel } from "blaise-design-system-react-components";
import React, { type ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { clientLogger } from "../../client/logger";
import {
  getQuestionnaire,
  getQuestionnaireModes,
  getSurveyDays,
} from "../../client/questionnaires";
import Breadcrumbs from "../breadcrumbs";
import CreateDonorCasesSummary from "../createDonorCasePage/createDonorCasesSummary";
import ReissueNewDonorCaseSummary from "../reissueNewDonorCasePage/reissueNewDonorCaseSummary";

import BlaiseNodeInfo from "./sections/blaiseNodeInfo";
import CatiModeDetails from "./sections/catiModeDetails";
import CawiModeDetails from "./sections/cawiModeDetails";
import CreateDonorCases from "./sections/createDonorCases";
import QuestionnaireDetails from "./sections/questionnaireDetails";
import QuestionnaireSettingsSection from "./sections/questionnaireSettingsSection";
import ReissueNewDonorCase from "./sections/reissueNewDonorCase";
import TotalmobileDetails from "./sections/totalmobileDetails";
import YearCalendar from "./sections/yearCalendar";

interface State {
  section?: string;
  questionnaire: Questionnaire | null;
  responseMessage?: string;
  statusCode?: number;
  role?: string;
}

function QuestionnaireDetailsPage(): ReactElement {
  const location = useLocation().state as State;
  const navigate = useNavigate();
  const initialState = useMemo(() => location || { questionnaire: null }, [location]);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | undefined>(
    initialState.questionnaire ?? undefined,
  );
  const [modes, setModes] = useState<string[]>([]);
  const [surveyDays, setSurveyDays] = useState<string[]>([]);
  const [errored, setErrored] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const { questionnaireName } = useParams();
  const { section, responseMessage, statusCode, role } = location || {
    section: "",
    responseMessage: "",
    statusCode: 0,
    role: "",
  };

  const loadQuestionnaire = useCallback(async (): Promise<void> => {
    setLoaded(false);
    if (questionnaireName) {
      const fetchedQuestionnaire = await getQuestionnaire(questionnaireName);

      if (!fetchedQuestionnaire) {
        navigate("/");

        return;
      }

      setQuestionnaire(fetchedQuestionnaire);
    }
  }, [navigate, questionnaireName]);

  useEffect(() => {
    if (initialState.questionnaire === null) {
      loadQuestionnaire()
        .then(() => {
          clientLogger.info(`Loaded questionnaire: ${questionnaireName}`);
        })
        .catch((error: unknown) => {
          clientLogger.info(`Failed to get questionnaire ${error}`);
          setErrored(true);
          setLoaded(true);
        });
    }

    if (questionnaireName)
      getQuestionnaireModes(questionnaireName)
        .then((modes) => {
          if (modes.length === 0) {
            clientLogger.error("returned questionnaire mode was empty");
            setErrored(true);
            setLoaded(true);

            return;
          }

          if (modes.includes("CATI")) {
            getSurveyDays(questionnaireName)
              .then((surveyDays) => {
                if (surveyDays.length === 0) {
                  clientLogger.info("returned questionnaire survey days was empty");
                  setSurveyDays(surveyDays);
                  setLoaded(true);

                  return;
                }

                clientLogger.info(`returned questionnaire survey days: ${surveyDays}`);
                setSurveyDays(surveyDays);
                setLoaded(true);
              })
              .catch((error: unknown) => {
                clientLogger.error(`Error getting questionnaire survey days ${error}`);
                setErrored(true);
                setLoaded(true);

                return;
              });
          }

          clientLogger.info(`returned questionnaire mode: ${modes}`);
          setModes(modes);
          setLoaded(true);
        })
        .catch((error: unknown) => {
          clientLogger.error(`Error getting questionnaire modes ${error}`);
          setErrored(true);
          setLoaded(true);

          return;
        });
  }, [initialState.questionnaire, loadQuestionnaire, questionnaireName]);

  return (
    <>
      <Breadcrumbs breadcrumbList={[{ link: "/", title: "Home" }]} />

      <main
        id="main-content"
        className="ons-page__main ons-u-mt-no"
      >
        {!loaded && <LoadingPanel />}
        {loaded && (errored || !questionnaire) && (
          <Panel status="error">Could not get questionnaire details, please try again</Panel>
        )}
        {loaded && !errored && questionnaire && (
          <>
            <h1 className="ons-u-mb-l">{questionnaire.name}</h1>
            {section === "createDonorCases" && responseMessage && statusCode && role && (
              <CreateDonorCasesSummary
                donorCasesResponseMessage={responseMessage}
                donorCasesStatusCode={statusCode}
                role={role}
              />
            )}
            {section === "reissueNewDonorCase" && responseMessage && statusCode && role && (
              <ReissueNewDonorCaseSummary
                responseMessage={responseMessage}
                statusCode={statusCode}
                role={role}
              />
            )}
            <QuestionnaireDetails
              questionnaire={questionnaire}
              modes={modes}
            />
            {questionnaire.name.includes("IPS") && (
              <CreateDonorCases questionnaire={questionnaire} />
            )}
            {questionnaire.name.includes("IPS") && (
              <ReissueNewDonorCase questionnaire={questionnaire} />
            )}
            <ErrorBoundary errorMessageText="Failed to load Telephone Operations details">
              <CatiModeDetails
                questionnaireName={questionnaire.name}
                modes={modes}
              />
            </ErrorBoundary>
            <ErrorBoundary errorMessageText="Failed to load CAWI mode details">
              <CawiModeDetails
                questionnaire={questionnaire}
                modes={modes}
              />
            </ErrorBoundary>
            <ErrorBoundary errorMessageText="Failed to load Totalmobile details">
              <TotalmobileDetails questionnaireName={questionnaire.name} />
            </ErrorBoundary>
            <ErrorBoundary errorMessageText="Failed to load questionnaire settings">
              <QuestionnaireSettingsSection
                questionnaire={questionnaire}
                modes={modes}
              />
            </ErrorBoundary>
            <ErrorBoundary errorMessageText="Failed to load survey days calendar">
              <YearCalendar
                modes={modes}
                surveyDays={surveyDays}
              />
            </ErrorBoundary>
            <ErrorBoundary errorMessageText="Failed to load Blaise node information">
              <BlaiseNodeInfo questionnaire={questionnaire} />
            </ErrorBoundary>

            <br></br>

            <Button
              label={"Delete Questionnaire"}
              primary={false}
              aria-label={`Delete questionnaire ${questionnaire.name}`}
              id="delete-questionnaire"
              onClick={() => navigate("/delete", { state: { questionnaire, modes } })}
            />
          </>
        )}
      </main>
    </>
  );
}

export default QuestionnaireDetailsPage;
