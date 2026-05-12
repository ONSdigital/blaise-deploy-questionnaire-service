import { StyledFormErrorSummary } from "blaise-design-system-react-components";
import React, { type ReactElement } from "react";

import { SetDate } from "./setDate";

interface SelectFilePageProps {
  questionnaireName: string;
}

export function AskStartDate({ questionnaireName }: SelectFilePageProps): ReactElement {
  return (
    <>
      <div className="ons-grid">
        <div className="ons-grid__col ons-col-8@m">
          <h1 className="ons-u-mb-l">
            Would you like to set a Telephone Operations start date for questionnaire{" "}
            <em className="ons-highlight">{questionnaireName}</em>?
          </h1>

          <p>
            This is used by the TOBI service to determine after what date a questionnaire should be
            visible for telephone operators to start interviewing. If it not set, TOBI will use the
            surveys days to determine when to display.
          </p>

          <StyledFormErrorSummary />

          <SetDate dateType="start" />
        </div>
      </div>
    </>
  );
}
