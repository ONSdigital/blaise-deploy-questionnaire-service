import { Button, Panel } from "blaise-design-system-react-components";
import React, { type ReactElement } from "react";

type DeploymentOutcomeProps = {
  questionnaireName: string;
  status: string;
  onViewQuestionnaires: () => void;
  onRetry?: () => void;
  retryLabel?: string;
};

export function DeploymentOutcome({
  questionnaireName,
  status,
  onViewQuestionnaires,
  onRetry,
  retryLabel = "Return to deploy questionnaire",
}: DeploymentOutcomeProps): ReactElement {
  return (
    <>
      {status === "" ? (
        <Panel
          status="success"
          bigIcon={true}
        >
          <h1>
            Questionnaire <em>{questionnaireName}</em> deployed successfully
          </h1>
        </Panel>
      ) : (
        <>
          <h1 className="ons-u-mb-l ons-u-mt-m">
            Questionnaire <em>{questionnaireName}</em> deploy failed
          </h1>
          <Panel status="error">
            <p>
              <b>Questionnaire deploy failed</b>
              <br />
              <br />
              Questionnaire {questionnaireName} has failed to deploy. When reporting the issue to
              Service Desk provide the questionnaire name, time and date of failure.
            </p>
            <p>Reason: {status}</p>
          </Panel>
        </>
      )}

      <div className="ons-btn-group ons-u-mt-m">
        {status !== "" && onRetry && (
          <Button
            label={retryLabel}
            primary={true}
            onClick={onRetry}
          />
        )}
        <Button
          label="View questionnaires"
          primary={status === ""}
          onClick={onViewQuestionnaires}
        />
      </div>
    </>
  );
}
