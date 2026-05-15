import { Button, Panel } from "blaise-design-system-react-components";
import React, { type ReactElement } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  questionnaireName: string;
}

function ErroneousWarning({ questionnaireName }: Props): ReactElement {
  const navigate = useNavigate();

  return (
    <>
      <div className="ons-u-mb-m">
        <Panel status="error">
          <h1>
            Unable to delete questionnaire <em className="ons-highlight">{questionnaireName}</em>{" "}
            because it is in a failed state.
          </h1>
          <p>An error has occurred with the questionnaire, in this state it cannot be deleted.</p>
          <p>
            You can <a href="https://ons.service-now.com/">report this issue</a> to Service Desk.
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

export { ErroneousWarning };
