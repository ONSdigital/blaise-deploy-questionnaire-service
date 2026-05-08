import type { Questionnaire } from "blaise-api-node-client";
import { Button, LoadingPanel, Panel } from "blaise-design-system-react-components";
import React, { type ReactElement, useEffect, useState } from "react";

import { removeToStartDateAndDeleteQuestionnaire } from "../../client/componentProcesses";
import { clientLogger } from "../../client/logger";
import { surveyIsActive } from "../../client/questionnaires";

interface Props {
  questionnaire: Questionnaire;
  modes: string[];
  onDelete: (message: string) => void;
  onCancel: () => void;
}

function DeleteWarning({ questionnaire, modes, onDelete, onCancel }: Props): ReactElement {
  const needsCatiCheck = modes.includes("CATI");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(!needsCatiCheck);
  const [active, setActive] = useState<boolean>(false);
  const [errored, setErrored] = useState<boolean>(false);

  useEffect(() => {
    if (!needsCatiCheck) {
      return;
    }

    surveyIsActive(questionnaire.name)
      .then((isActive: boolean) => {
        clientLogger.info(`Survey has active survey days: ${isActive}`);
        setActive(isActive);
        setLoaded(true);
      })
      .catch((error: unknown) => {
        clientLogger.error(`Failed to get survey is active: ${error}`);
        setErrored(true);
        setLoaded(true);
      });
  }, [needsCatiCheck, questionnaire.name]);

  async function confirmDelete() {
    setMessage("");
    setLoading(true);

    const [deleted, message] = await removeToStartDateAndDeleteQuestionnaire(questionnaire.name);

    if (!deleted) {
      setMessage(message);
      setLoading(false);

      return;
    }

    setLoading(false);
    onDelete(`Questionnaire: ${questionnaire.name} Successfully deleted`);
  }

  if (!loaded) {
    return <LoadingPanel />;
  }

  if (errored) {
    return <Panel status="error">Could not get warning details, please try again</Panel>;
  }

  return (
    <>
      <h1 className="ons-u-mb-l">
        Are you sure you want to delete the questionnaire{" "}
        <em className="highlight">{questionnaire.name}</em>?
      </h1>

      {modes.includes("CATI") && questionnaire.status?.toLowerCase() === "active" && active && (
        <Panel status="error">Questionnaire has active Telephone Operations survey days</Panel>
      )}

      {modes.includes("CAWI") && questionnaire.status?.toLowerCase() === "active" && (
        <Panel status="error">Questionnaire is active for web collection</Panel>
      )}

      <Panel status="warn">
        The questionnaire and all associated respondent data will be deleted
      </Panel>

      {message !== "" && <Panel status="error">{message}</Panel>}

      <form>
        <br />
        <Button
          label="Delete"
          primary={true}
          loading={loading}
          id="confirm-delete"
          onClick={() => confirmDelete()}
        />
        {!loading && (
          <Button
            label="Cancel"
            primary={false}
            id="cancel-delete"
            onClick={() => onCancel()}
          />
        )}
      </form>
    </>
  );
}

export default DeleteWarning;
