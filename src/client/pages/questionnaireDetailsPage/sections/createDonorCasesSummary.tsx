import { ExternalLink, Panel } from "blaise-design-system-react-components";
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
  const normalizedResponseMessage = donorCasesResponseMessage.replace(/^"(.*)"$/s, "$1");
  const isMissingUsersForRoleError = /no users found with role/i.test(normalizedResponseMessage);

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
          <p>{normalizedResponseMessage}</p>
          {isMissingUsersForRoleError ? (
            <p>Add a user to this role and try creating donor cases again.</p>
          ) : (
            <p>
              Please report this issue to{" "}
              <ExternalLink
                text="Service Desk"
                link="https://ons.service-now.com/"
              />{" "}
              and include the questionnaire name, user role, and the date and time of failure.
            </p>
          )}
        </Panel>
      )}
    </div>
  );
}
