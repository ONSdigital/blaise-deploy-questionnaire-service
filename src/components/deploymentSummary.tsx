import { Button, Panel } from "blaise-design-system-react-components";
import React, { type ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface Location {
  questionnaireName: string;
  status: string;
}

function DeploymentSummary(): ReactElement {
  const location = useLocation().state as Location;
  const navigate = useNavigate();
  const { questionnaireName, status } = location || { questionnaireName: "/" };

  return (
    <>
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-no"
      >
        {status === "" ? (
          <Panel
            status="success"
            bigIcon={true}
          >
            <h1>
              Questionnaire file <em>{questionnaireName}</em> deployed
            </h1>
            <p>
              The questionnaire file has been successfully deployed and will be displayed within the
              table of questionnaires.
            </p>
          </Panel>
        ) : (
          <>
            <h1 className="ons-u-mb-l ons-u-mt-m">
              Questionnaire file <em>{questionnaireName}</em> deploy failed
            </h1>
            <Panel status="error">
              <p>
                <b>File deploy failed</b>
                <br />
                <br />
                Questionnaire {questionnaireName} has failed to deploy. When reporting the issue to
                Service Desk provide the questionnaire name, time and date of failure.
              </p>
              <p>Reason: {status}</p>
            </Panel>
          </>
        )}

        <br />
        <br />
        {status !== "" && (
          <Button
            label="Return to select survey package page"
            primary={true}
            onClick={() => navigate("/upload")}
          />
        )}
        <Button
          label="Go to table of questionnaires"
          primary={status === ""}
          onClick={() => navigate("/")}
        />
      </main>
    </>
  );
}

export default DeploymentSummary;
