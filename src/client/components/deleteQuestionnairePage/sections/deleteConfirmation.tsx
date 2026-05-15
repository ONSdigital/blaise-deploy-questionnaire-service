import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, LoadingPanel, Panel } from "blaise-design-system-react-components";
import React, { type ReactElement, useState } from "react";

import { deleteQuestionnaireAndRelatedDates } from "../../../api/processes";
import { surveyIsActive } from "../../../api/questionnaires";
import { clientLogger } from "../../../utils/logger";

import type { Questionnaire } from "blaise-api-node-client";

interface Props {
  questionnaire: Questionnaire;
  modes: string[];
  onDelete: (questionnaireName: string) => void;
  onCancel: () => void;
}

function DeleteConfirmation({ questionnaire, modes, onDelete, onCancel }: Props): ReactElement {
  const needsCatiCheck = modes.includes("CATI");
  const [message, setMessage] = useState<string>("");

  const {
    data: active = false,
    isLoading: activeLoading,
    error: activeError,
  } = useQuery({
    queryKey: ["surveyIsActive", questionnaire.name],
    queryFn: async () => {
      const isActive = await surveyIsActive(questionnaire.name);

      clientLogger.info(`Survey has active survey days: ${isActive}`);

      return isActive;
    },
    enabled: needsCatiCheck,
  });

  const { mutate: confirmDeleteMutation, isPending: deleting } = useMutation({
    mutationFn: () => deleteQuestionnaireAndRelatedDates(questionnaire.name),
    onSuccess: ([deleted, msg]) => {
      if (!deleted) {
        setMessage(msg);

        return;
      }

      onDelete(questionnaire.name);
    },
  });

  if (needsCatiCheck && activeLoading) {
    return <LoadingPanel />;
  }

  if (activeError) {
    return <Panel status="error">Could not get warning details, please try again</Panel>;
  }

  return (
    <>
      <h1 className="ons-u-mb-l">
        Are you sure you want to delete questionnaire{" "}
        <em className="ons-highlight">{questionnaire.name}</em>?
      </h1>

      {modes.includes("CATI") && questionnaire.status?.toLowerCase() === "active" && active && (
        <div className="ons-u-mb-m">
          <Panel status="error">Questionnaire has active survey days</Panel>
        </div>
      )}

      {modes.includes("CAWI") && questionnaire.status?.toLowerCase() === "active" && (
        <div className="ons-u-mb-m">
          <Panel status="error">Questionnaire is active for web collection</Panel>
        </div>
      )}

      <div className="ons-u-mb-m">
        <Panel status="warn">
          The questionnaire and all associated respondent data will be deleted
        </Panel>
      </div>

      {message !== "" && (
        <div className="ons-u-mb-m">
          <Panel status="error">{message}</Panel>
        </div>
      )}

      <div className="ons-btn-group ons-u-mt-m">
        <Button
          label="Delete"
          primary={true}
          loading={deleting}
          id="confirm-delete"
          onClick={() => confirmDeleteMutation()}
        />
        {!deleting && (
          <Button
            label="Cancel"
            primary={false}
            id="cancel-delete"
            onClick={() => onCancel()}
          />
        )}
      </div>
    </>
  );
}

export { DeleteConfirmation };
