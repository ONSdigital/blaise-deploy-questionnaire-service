import { Button, Panel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  questionnaireName: string;
}

function FailedStateWarning({ questionnaireName }: Props): ReactElement {
  const navigate = useNavigate();

  return (
    <>
      <div className="ons-u-mb-m">
        <Panel status="error">
          <h1>
            Unable to delete questionnaire <em className="ons-highlight">{questionnaireName}</em>{" "}
            because it is in a failed state.
          </h1>
          <p>
            Please report this issue to <a href="https://ons.service-now.com/">Service Desk</a> and
            include the questionnaire name and the date and time of failure.
          </p>
        </Panel>
      </div>
      <div className="ons-btn-group ons-u-mt-m">
        <Button
          label="View questionnaires"
          primary={true}
          onClick={() => navigate("/")}
        />
      </div>
    </>
  );
}

export { FailedStateWarning };
