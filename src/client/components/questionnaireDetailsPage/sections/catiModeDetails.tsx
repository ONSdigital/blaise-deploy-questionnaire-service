import { useQuery } from "@tanstack/react-query";
import { LoadingPanel, Panel } from "blaise-design-system-react-components";
import dateFormatter from "dayjs";
import React, { type ReactElement } from "react";
import { Link } from "react-router-dom";

import { getToStartDate } from "../../../api/toStartDate";
import { formatRelativeDate } from "../../../utils/formatRelativeDate";

interface Props {
  questionnaireName: string;
  modes: string[];
}

function CatiModeDetails({ questionnaireName, modes }: Props): ReactElement {
  const isCatiQuestionnaire = modes.includes("CATI");

  const {
    data: toStartDateValue = "",
    isLoading,
    error,
  } = useQuery({
    queryKey: ["toStartDate", questionnaireName],
    queryFn: () => getToStartDate(questionnaireName),
    enabled: isCatiQuestionnaire,
  });

  const toStartDate = toStartDateValue !== "";

  if (!isCatiQuestionnaire) {
    return <></>;
  }

  if (isLoading) {
    return (
      <div
        className="ons-u-mb-m"
        aria-busy="true"
      >
        <LoadingPanel message={"Getting Telephone Operations start date"} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="ons-u-mb-m">
        <Panel status={"error"}>Failed to get Telephone Operations start date</Panel>
      </div>
    );
  }

  return (
    <div className="ons-summary ons-u-mb-m">
      <div className="ons-summary__group">
        <h2 className="ons-summary__group-title">CATI mode details</h2>

        {/* CHANGED: Replaced the legacy table markup with the strict 2-column <dl> grid, matching CAWI */}
        <dl className="ons-summary__items">
          <div className="ons-summary__item">
            {/* Column 1: Title AND Action Link (Forces link to the left) */}
            <dt className="ons-summary__item-title">
              <div className="ons-summary__item--text">Telephone Operations start date</div>

              {/* CHANGED: Placed the action links underneath the title text to left-align them */}
              <div className="ons-u-mt-m ons-u-mb-s">
                {toStartDate ? (
                  <Link
                    to={`/questionnaire/${questionnaireName}/start-date`}
                    state={{ questionnaireName: questionnaireName, toStartDate: toStartDateValue }}
                    className="ons-summary__button"
                    aria-label={`Change or delete start date for questionnaire ${questionnaireName}`}
                  >
                    Change or delete start date
                  </Link>
                ) : (
                  <Link
                    to={`/questionnaire/${questionnaireName}/start-date`}
                    state={{ questionnaireName: questionnaireName }}
                    className="ons-summary__button"
                    aria-label={`Add a start date for questionnaire ${questionnaireName}`}
                  >
                    Add start date
                  </Link>
                )}
              </div>
            </dt>

            {/* Column 2: Values (Bolded text) */}
            <dd className="ons-summary__values">
              {/* CHANGED: Added ons-u-fw-b to bold the resulting data text to match CAWI layout */}
              <span className="ons-summary__text ons-u-fw-b">
                {toStartDate ? (
                  <>
                    {dateFormatter(toStartDateValue).format("DD/MM/YYYY")} (
                    {formatRelativeDate(toStartDateValue)})
                  </>
                ) : (
                  "No start date specified, using survey days"
                )}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export { CatiModeDetails };
