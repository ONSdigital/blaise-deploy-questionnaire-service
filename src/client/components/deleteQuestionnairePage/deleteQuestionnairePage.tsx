import { useQuery } from "@tanstack/react-query";
import { LoadingPanel, Panel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";

import { getQuestionnaire, getQuestionnaireModes } from "../../api/questionnaires";

import { DeleteConfirmation } from "./sections/deleteConfirmation";
import { FailedStateWarning } from "./sections/failedStateWarning";

import type { Questionnaire } from "blaise-api-node-client";

interface Location {
  questionnaire?: Questionnaire;
  modes?: string[];
}

interface Props {
  onDelete: (questionnaireName: string) => void;
  onCancel: (questionnaireName: string) => void;
}

function DeleteQuestionnairePage({ onDelete, onCancel }: Props): ReactElement {
  const location = useLocation().state as Location | undefined;
  const routeParams = useParams();
  const questionnaireName = routeParams.questionnaireName ?? location?.questionnaire?.name ?? "";

  const {
    data: fetchedQuestionnaire,
    isLoading: questionnaireLoading,
    error: questionnaireError,
  } = useQuery({
    queryKey: ["deleteQuestionnairePageQuestionnaire", questionnaireName],
    queryFn: () => getQuestionnaire(questionnaireName),
    enabled: !!questionnaireName && !location?.questionnaire,
  });

  const {
    data: fetchedModes = [],
    isLoading: modesLoading,
    error: modesError,
  } = useQuery({
    queryKey: ["deleteQuestionnairePageModes", questionnaireName],
    queryFn: () => getQuestionnaireModes(questionnaireName),
    enabled: !!questionnaireName && !location?.modes,
  });

  const questionnaire = location?.questionnaire ?? fetchedQuestionnaire;
  const modes = location?.modes ?? fetchedModes;

  if (questionnaireName && (questionnaireLoading || modesLoading)) {
    return (
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        <LoadingPanel />
      </main>
    );
  }

  if (questionnaireName && (questionnaireError || modesError)) {
    return (
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        <Panel status="error">Failed to get delete questionnaire confirmation details</Panel>
      </main>
    );
  }

  if (questionnaireName && !questionnaire) {
    return (
      <Navigate
        to="/"
        replace={true}
      />
    );
  }

  const fallbackQuestionnaire: Questionnaire =
    questionnaire ??
    ({
      name: "",
      status: "",
      fieldPeriod: "",
      installDate: "",
      serverParkName: "",
    } as Questionnaire);

  return (
    <>
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        {fallbackQuestionnaire.status === "Failed" ? (
          <FailedStateWarning questionnaireName={fallbackQuestionnaire.name} />
        ) : (
          <DeleteConfirmation
            questionnaire={fallbackQuestionnaire}
            modes={modes}
            onDelete={onDelete}
            onCancel={() => onCancel(questionnaireName)}
          />
        )}
      </main>
    </>
  );
}

export default DeleteQuestionnairePage;
