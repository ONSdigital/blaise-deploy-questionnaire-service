import { useQuery } from "@tanstack/react-query";
import { LoadingPanel, Panel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";

import { getQuestionnaire, getQuestionnaireModes } from "../../api/questionnaires";
import { readStateQuestionnaire, readStateStringArray } from "../../utils/locationState";

import { DeleteConfirmation } from "./sections/deleteConfirmation";
import { FailedStateWarning } from "./sections/failedStateWarning";

import type { Questionnaire } from "blaise-api-node-client";

interface Props {
  onDelete: (questionnaireName: string) => void;
  onCancel: (questionnaireName: string) => void;
}

function DeleteQuestionnairePage({ onDelete, onCancel }: Props): ReactElement {
  const location = useLocation();
  const routeParams = useParams();
  // Changed: narrow router state explicitly so invalid navigation state falls back to the safe route parameter path.
  const questionnaireFromState = readStateQuestionnaire(location.state, "questionnaire");
  const modesFromState = readStateStringArray(location.state, "modes");
  const questionnaireName = routeParams.questionnaireName ?? questionnaireFromState?.name ?? "";

  const {
    data: fetchedQuestionnaire,
    isLoading: questionnaireLoading,
    error: questionnaireError,
  } = useQuery({
    queryKey: ["deleteQuestionnairePageQuestionnaire", questionnaireName],
    queryFn: () => getQuestionnaire(questionnaireName),
    enabled: !!questionnaireName && !questionnaireFromState,
  });

  const {
    data: fetchedModes = [],
    isLoading: modesLoading,
    error: modesError,
  } = useQuery({
    queryKey: ["deleteQuestionnairePageModes", questionnaireName],
    queryFn: () => getQuestionnaireModes(questionnaireName),
    enabled: !!questionnaireName && !modesFromState,
  });

  const questionnaire = questionnaireFromState ?? fetchedQuestionnaire;
  const modes = modesFromState ?? fetchedModes;

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

  const selectedQuestionnaire: Questionnaire = questionnaire ?? {
    name: "",
    status: "",
    installDate: "",
    serverParkName: "",
  };

  return (
    <>
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        {selectedQuestionnaire.status === "Failed" ? (
          <FailedStateWarning questionnaireName={selectedQuestionnaire.name} />
        ) : (
          <DeleteConfirmation
            questionnaire={selectedQuestionnaire}
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
