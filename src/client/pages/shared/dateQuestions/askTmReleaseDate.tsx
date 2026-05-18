import { StyledFormErrorSummary } from "blaise-design-system-react-components";
import { type ReactElement } from "react";

import { SetDate } from "./setDate";

interface SelectFilePageProps {
  questionnaireName: string;
}

export function AskTmReleaseDate({ questionnaireName }: SelectFilePageProps): ReactElement {
  return (
    <>
      <div className="ons-grid">
        <div className="ons-grid__col ons-col-8@m">
          <h1 className="ons-u-mb-l">
            Would you like to set a Totalmobile release date for questionnaire{" "}
            <span className="ons-highlight">{questionnaireName}</span>?
          </h1>

          <p>
            This determines when selected cases are sent to Totalmobile for field allocation. If you
            do not select a date, no cases will be sent to Totalmobile.
          </p>

          <StyledFormErrorSummary />

          <SetDate
            dateFieldName="tmReleaseDate"
            fullDateLabel="Totalmobile release date"
            shortDateLabel="release date"
          />
        </div>
      </div>
    </>
  );
}
