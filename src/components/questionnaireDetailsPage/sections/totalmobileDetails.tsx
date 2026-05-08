import { LoadingPanel, Panel } from "blaise-design-system-react-components";
import dateFormatter from "dayjs";
import React, { type ReactElement, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getTmReleaseDate } from "../../../client/tmReleaseDate";
import { totalmobileReleaseDateSurveyTLAs } from "../../../utilities/totalmobileReleaseDateSurveyTLAs";
import { formatRelativeDate } from "../../../utilities/formatRelativeDate";

interface Props {
  questionnaireName: string;
}

function TotalmobileDetails({ questionnaireName }: Props): ReactElement {
  const shouldShowTotalmobileDetails = totalmobileReleaseDateSurveyTLAs.some((tla) =>
    questionnaireName.includes(tla),
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [errored, setErrored] = useState<boolean>(false);
  const [tmReleaseDate, setTmReleaseDate] = useState<boolean>(false);
  const [tmReleaseDateValue, setTmReleaseDateValue] = useState<string>("");

  function renderReleaseDate(): ReactElement | string {
    const parsedReleaseDate = dateFormatter(tmReleaseDateValue);

    if (!parsedReleaseDate.isValid()) {
      return tmReleaseDateValue;
    }

    return (
      <>
        {parsedReleaseDate.format("DD/MM/YYYY")} (
        {formatRelativeDate(parsedReleaseDate.toDate())}
        )
      </>
    );
  }

  const getTmReleaseDateForQuestionnaire = useCallback(async () => {
    setLoading(true);
    setErrored(false);

    try {
      // CHANGED: Renamed local variable to 'fetchedTmReleaseDate' to prevent shadowing the 'tmReleaseDate' state boolean
      const fetchedTmReleaseDate = await getTmReleaseDate(questionnaireName);

      if (fetchedTmReleaseDate === "") {
        setTmReleaseDate(false);

        return;
      }

      setTmReleaseDate(true);
      setTmReleaseDateValue(fetchedTmReleaseDate);
    } catch {
      setErrored(true);
    }
  }, [questionnaireName]);

  useEffect(() => {
    if (!shouldShowTotalmobileDetails) {
      return;
    }

    getTmReleaseDateForQuestionnaire().then(() => setLoading(false));
  }, [getTmReleaseDateForQuestionnaire, shouldShowTotalmobileDetails]);

  if (!shouldShowTotalmobileDetails) {
    return <></>;
  }

  if (loading) {
    return (
      <div
        className="ons-u-mb-m"
        aria-busy="true"
      >
        <LoadingPanel message={"Getting Totalmobile release date"} />
      </div>
    );
  }

  if (errored) {
    return (
      <div className="ons-u-mb-m">
        <Panel status={"error"}>Failed to get Totalmobile release date</Panel>
      </div>
    );
  }

  return (
    <div className="ons-summary ons-u-mb-m elementToFadeIn">
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
                    to="/questionnaire/release-date"
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
                    to="/questionnaire/release-date"
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

export default TotalmobileDetails;
