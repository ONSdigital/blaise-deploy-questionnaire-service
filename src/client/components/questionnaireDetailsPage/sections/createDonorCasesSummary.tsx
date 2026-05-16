import { Panel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";

interface Props {
  donorCasesResponseMessage: string;
  donorCasesStatusCode: number;
  role: string;
}

export function CreateDonorCasesSummary({
  donorCasesResponseMessage,
  donorCasesStatusCode,
  role,
}: Props): ReactElement {
  return (
    <div className="ons-u-mb-m">
      {donorCasesStatusCode === 200 ? (
        <Panel
          status="success"
          bigIcon={true}
        >
          <h1>Donor cases created successfully for {role}</h1>
        </Panel>
      ) : (
        <Panel status="error">
          <h1>Error creating donor cases for {role}</h1>
          <p>{donorCasesResponseMessage}</p>
          <p>
            Please report this issue to <a href="https://ons.service-now.com/">Service Desk</a> and
            include the questionnaire name, user role, and the date and time of failure.
          </p>
        </Panel>
      )}
    </div>
  );
}
