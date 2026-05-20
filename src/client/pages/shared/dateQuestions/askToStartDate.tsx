import { type ReactElement } from "react";

import { SetDate } from "./setDate";

interface SelectFilePageProps {
  questionnaireName: string;
}

export function AskToStartDate({ questionnaireName }: SelectFilePageProps): ReactElement {
  return (
    <>
      <div className="ons-grid">
        <div className="ons-grid__col ons-col-8@m">
          <h1 className="ons-u-mb-l">
            Would you like to set a Telephone Operations start date for questionnaire{" "}
            <span className="ons-highlight">{questionnaireName}</span>?
          </h1>

          <p>
            This is used by the TOBI service to determine when a questionnaire should be visible to
            Telephone Operators for interviewing. If it is not set, TOBI will use survey days to
            determine when to make it available.
          </p>

          <SetDate
            dateFieldName="toStartDate"
            fullDateLabel="Telephone Operations start date"
            shortDateLabel="start date"
          />
        </div>
      </div>
    </>
  );
}
