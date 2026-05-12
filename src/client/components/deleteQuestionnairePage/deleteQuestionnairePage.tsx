import React, { type ReactElement } from "react";
import { useLocation, useParams } from "react-router-dom";

import { DeleteConfirmation } from "./sections/deleteConfirmation";
import { ErroneousWarning } from "./sections/erroneousWarning";

import type { Questionnaire } from "blaise-api-node-client";

interface Location {
  questionnaire: Questionnaire;
  modes: string[];
}

interface Props {
  onDelete: (status: string) => void;
  onCancel: (questionnaireName: string) => void;
}

function DeleteQuestionnairePage({ onDelete, onCancel }: Props): ReactElement {
  const location = useLocation().state as Location;
  const routeParams = useParams();
  const { questionnaire, modes } = location || { questionnaire: "", modes: "" };
  const questionnaireName = routeParams.questionnaireName ?? questionnaire?.name ?? "";

  return (
    <>
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        {questionnaire.status === "Failed" ? (
          <ErroneousWarning questionnaireName={questionnaire.name} />
        ) : (
          <DeleteConfirmation
            questionnaire={questionnaire}
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
