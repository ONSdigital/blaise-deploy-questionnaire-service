import { useQuery } from "@tanstack/react-query";
import { LoadingPanel, Panel } from "blaise-design-system-react-components";
import dateFormatter from "dayjs";
import React, { type ReactElement } from "react";
import { Link } from "react-router-dom";

import { getTmReleaseDate } from "../../../api/tmReleaseDate";
import { shouldAskTmReleaseDate } from "../../../utils/deploymentDateQuestionRules";
import { formatRelativeDate } from "../../../utils/formatRelativeDate";

interface Props {
  questionnaireName: string;
}

function ReleaseDate({ questionnaireName }: Props): ReactElement {
  const shouldShowReleaseDateDetails = shouldAskTmReleaseDate(questionnaireName);

  const {
    data: tmReleaseDateValue = "",
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tmReleaseDate", questionnaireName],
    queryFn: () => getTmReleaseDate(questionnaireName),
    enabled: shouldShowReleaseDateDetails,
  });

  const tmReleaseDate = tmReleaseDateValue !== "";

  function renderReleaseDate(): ReactElement | string {
    const parsedReleaseDate = dateFormatter(tmReleaseDateValue);

    if (!parsedReleaseDate.isValid()) {
      return tmReleaseDateValue;
    }

    return (
      <>
        {parsedReleaseDate.format("DD/MM/YYYY")} ({formatRelativeDate(parsedReleaseDate.toDate())})
      </>
    );
  }

  if (!shouldShowReleaseDateDetails) {
    return <></>;
  }

  if (isLoading) {
    return (
      <div
        className="ons-u-mb-m"
        aria-busy="true"
      >
        <LoadingPanel message={"Getting Totalmobile release date"} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="ons-u-mb-m">
        <Panel status={"error"}>Failed to get Totalmobile release date</Panel>
      </div>
    );
  }

  return (
    <div className="ons-summary ons-u-mb-m">
      <div className="ons-summary__group">
        <h2 className="ons-summary__group-title">Totalmobile details</h2>

        {/* CHANGED: Replaced the legacy table markup with the strict 2-column <dl> grid, matching CAWI and CATI */}
        <dl className="ons-summary__items">
          <div className="ons-summary__item">
            {/* Column 1: Title AND Action Link (Forces link to the left) */}
            <dt className="ons-summary__item-title">
              <div className="ons-summary__item--text">Totalmobile release date</div>

              {/* CHANGED: Placed the action links underneath the title text to left-align them */}
              <div className="ons-u-mt-m ons-u-mb-s">
                {tmReleaseDate ? (
                  <Link
                    to={`/questionnaire/${questionnaireName}/release-date`}
                    state={{
                      questionnaireName: questionnaireName,
                      tmReleaseDate: tmReleaseDateValue,
                    }}
                    className="ons-summary__button"
                    aria-label={`Change or delete release date for questionnaire ${questionnaireName}`}
                  >
                    Change or delete release date
                  </Link>
                ) : (
                  <Link
                    to={`/questionnaire/${questionnaireName}/release-date`}
                    state={{ questionnaireName: questionnaireName }}
                    className="ons-summary__button"
                    aria-label={`Add a release date for questionnaire ${questionnaireName}`}
                  >
                    Add release date
                  </Link>
                )}
              </div>
            </dt>

            {/* Column 2: Values (Bolded text) */}
            <dd className="ons-summary__values">
              {/* CHANGED: Added ons-u-fw-b to bold the resulting data text to match the layout */}
              <span className="ons-summary__text ons-u-fw-b">
                {tmReleaseDate ? renderReleaseDate() : "No release date specified"}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export { ReleaseDate };
