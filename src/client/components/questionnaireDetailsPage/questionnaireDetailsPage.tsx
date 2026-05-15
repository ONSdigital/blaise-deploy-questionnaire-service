import { useQuery } from "@tanstack/react-query";
import { Button, ErrorBoundary, LoadingPanel, Panel } from "blaise-design-system-react-components";
import React, { type ReactElement, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { getQuestionnaire, getQuestionnaireModes, getSurveyDays } from "../../api/questionnaires";
import { clientLogger } from "../../utils/logger";

import { BlaiseNodeStates } from "./sections/blaiseNodeStates";
import { CatiModeDetails } from "./sections/catiModeDetails";
import { CawiModeDetails } from "./sections/cawiModeDetails";
import { CreateDonorCases } from "./sections/createDonorCases";
import { CreateDonorCasesSummary } from "./sections/createDonorCasesSummary";
import { QuestionnaireDetails } from "./sections/questionnaireDetails";
import { QuestionnaireSettings } from "./sections/questionnaireSettings";
import { ReissueNewDonorCase } from "./sections/reissueNewDonorCase";
import { ReissueNewDonorCaseSummary } from "./sections/reissueNewDonorCaseSummary";
import { TmReleaseDate } from "./sections/tmReleaseDate";
import { YearCalendar } from "./sections/yearCalendar";

import type { Questionnaire } from "blaise-api-node-client";

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
  const { questionnaireName } = useParams();
  const { section, responseMessage, statusCode, role } = location || {
    section: "",
    responseMessage: "",
    statusCode: 0,
    role: "",
  };

  const {
    data: fetchedQuestionnaire,
    isLoading: questionnaireLoading,
    error: questionnaireError,
  } = useQuery({
    queryKey: ["questionnaire", questionnaireName],
    queryFn: async () => {
      const q = await getQuestionnaire(questionnaireName!);

      if (!q) {
        navigate("/");

        return null;
      }

      clientLogger.info(`Loaded questionnaire: ${questionnaireName}`);

      return q;
    },
    enabled: initialState.questionnaire === null && !!questionnaireName,
  });

  const questionnaire: Questionnaire | undefined =
    initialState.questionnaire ?? fetchedQuestionnaire ?? undefined;

  const {
    data: modes = [],
    isLoading: modesLoading,
    error: modesError,
  } = useQuery({
    queryKey: ["questionnaireModes", questionnaireName],
    queryFn: async () => {
      const fetchedModes = await getQuestionnaireModes(questionnaireName!);

      if (fetchedModes.length === 0) {
        clientLogger.error("returned questionnaire mode was empty");
        throw new Error("returned questionnaire mode was empty");
      }

      clientLogger.info(`returned questionnaire mode: ${fetchedModes}`);

      return fetchedModes;
    },
    enabled: !!questionnaireName,
  });

  const isCati = modes.includes("CATI");

  const {
    data: surveyDays = [],
    isLoading: surveyDaysLoading,
    error: surveyDaysError,
  } = useQuery({
    queryKey: ["surveyDays", questionnaireName],
    queryFn: async () => {
      const days = await getSurveyDays(questionnaireName!);

      clientLogger.info(`returned questionnaire survey days: ${days}`);

      return days;
    },
    enabled: !!questionnaireName && isCati,
  });

  const isLoading = questionnaireLoading || modesLoading || (isCati && surveyDaysLoading);
  const errored = !!(questionnaireError || modesError || surveyDaysError);
  const loaded = !isLoading;

  return (
    <>
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        {isLoading && <LoadingPanel />}
        {loaded && (errored || !questionnaire) && (
          <Panel status="error">Failed to get questionnaire details, please try again</Panel>
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
              <TmReleaseDate questionnaireName={questionnaire.name} />
            </ErrorBoundary>
            <ErrorBoundary errorMessageText="Failed to load questionnaire settings">
              <QuestionnaireSettings
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
              <BlaiseNodeStates questionnaire={questionnaire} />
            </ErrorBoundary>

            <div className="ons-btn-group ons-u-mt-m">
              <Button
                label={"Delete Questionnaire"}
                primary={false}
                aria-label={`Delete questionnaire ${questionnaire.name}`}
                id="delete-questionnaire"
                onClick={() =>
                  navigate(`/questionnaire/${questionnaire.name}/delete`, {
                    state: { questionnaire, modes },
                  })
                }
              />
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default QuestionnaireDetailsPage;
