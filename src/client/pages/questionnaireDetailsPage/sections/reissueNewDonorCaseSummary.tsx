import { ExternalLink, Panel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";

interface Props {
  responseMessage: string;
  statusCode: number;
  user: string;
}

export function ReissueNewDonorCaseSummary({
  statusCode,
  user,
  responseMessage,
}: Props): ReactElement {
  const missingInitialDonorCase =
    typeof responseMessage === "string" &&
    responseMessage.includes("User has no existing donor cases.");

  return (
    <div className="ons-u-mb-m">
      {statusCode === 200 ? (
        <Panel
          status="success"
          bigIcon={true}
        >
          <h1>Reissued donor case successfully for {user}</h1>
        </Panel>
      ) : (
        <Panel status="error">
          <h1>Error reissuing donor case for {user}</h1>
          {missingInitialDonorCase ? (
            <p>
              User has not been issued with an initial donor case. Please click <b>Create cases</b>{" "}
              under the Donor cases section.
            </p>
          ) : (
            <p>
              Please report this issue to{" "}
              <ExternalLink
                text="Service Desk"
                link="https://ons.service-now.com/"
              />{" "}
              and include the questionnaire name, username, and the date and time of failure.
            </p>
          )}
        </Panel>
      )}
    </div>
  );
}
