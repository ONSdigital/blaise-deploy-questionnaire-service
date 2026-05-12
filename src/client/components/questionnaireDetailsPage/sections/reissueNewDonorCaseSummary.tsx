import { Panel } from "blaise-design-system-react-components";
import React, { type ReactElement } from "react";

interface Props {
  responseMessage: string;
  statusCode: number;
  role: string;
}

export function ReissueNewDonorCaseSummary({
  statusCode,
  role,
  responseMessage,
}: Props): ReactElement {
  const message =
    typeof responseMessage === "string" &&
    responseMessage.includes("User has no existing donor cases.")
      ? "User has not been issued with an initial donor case. Please click 'Create cases' under Donor case section."
      : "When reporting this issue to the Service Desk, please provide the questionnaire name, user, time and date of the failure.";

  return (
    <>
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        {statusCode === 200 ? (
          <Panel
            status="success"
            bigIcon={true}
          >
            <h1>Reissued donor case successfully for {role}</h1>
          </Panel>
        ) : (
          <Panel status="error">
            <h1>Error reissuing donor case for {role}.</h1>
            <p>{message}</p>
          </Panel>
        )}
      </main>
    </>
  );
}
