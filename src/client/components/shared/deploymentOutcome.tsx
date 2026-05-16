import { Button, Panel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";

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
          <h1>Questionnaire {questionnaireName} deployed successfully</h1>
        </Panel>
      ) : (
        <Panel status="error">
          <h1 className="ons-u-mb-l ons-u-mt-m">Questionnaire {questionnaireName} deploy failed</h1>
          <p>Details: {status}</p>
          <p>
            Please report this issue to <a href="https://ons.service-now.com/">Service Desk</a> and
            include the questionnaire name and the date and time of failure.
          </p>
        </Panel>
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
