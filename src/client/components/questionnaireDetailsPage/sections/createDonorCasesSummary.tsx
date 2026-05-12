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
    <>
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
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
              When reporting this issue to the Service Desk, please provide the questionnaire name,
              time and date of the failure.
            </p>
          </Panel>
        )}
      </main>
    </>
  );
}
