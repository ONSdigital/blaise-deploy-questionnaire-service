import { LoadingPanel, Panel } from "blaise-design-system-react-components";
import dateFormatter from "dayjs";
import React, { type ReactElement, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getToStartDate } from "../../../client/toStartDate";
import { formatRelativeDate } from "../../../utilities/formatRelativeDate";

interface Props {
  questionnaireName: string;
  modes: string[];
}

function CatiModeDetails({ questionnaireName, modes }: Props): ReactElement {
  const isCatiQuestionnaire = modes.includes("CATI");

  const [loading, setLoading] = useState<boolean>(true);
  const [errored, setErrored] = useState<boolean>(false);
  const [toStartDate, setToStartDate] = useState<boolean>(false);
  const [toStartDateValue, setToStartDateValue] = useState<string>("");

  const getToStartDateForQuestionnaire = useCallback(async () => {
    setLoading(true);
    setErrored(false);

    try {
      // CHANGED: Renamed variable to avoid shadowing the state boolean variable
      const fetchedStartDate = await getToStartDate(questionnaireName);

      if (fetchedStartDate === "") {
        setToStartDate(false);

        return;
      }

      setToStartDate(true);
      setToStartDateValue(fetchedStartDate);
    } catch {
      setErrored(true);
    }
  }, [questionnaireName]);

  useEffect(() => {
    if (!isCatiQuestionnaire) {
      return;
    }

    getToStartDateForQuestionnaire().then(() => setLoading(false));
  }, [getToStartDateForQuestionnaire, isCatiQuestionnaire]);

  if (!isCatiQuestionnaire) {
    return <></>;
  }

  if (loading) {
    return (
      <div
        className="ons-u-mb-m"
        aria-busy="true"
      >
        <LoadingPanel message={"Getting Telephone Operations start date"} />
      </div>
    );
  }

  if (errored) {
    return (
      <div className="ons-u-mb-m">
        <Panel status={"error"}>Failed to get Telephone Operations start date</Panel>
      </div>
    );
  }

  return (
    <div className="ons-summary ons-u-mb-m elementToFadeIn">
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
                    to="/questionnaire/start-date"
                    state={{ questionnaireName: questionnaireName, toStartDate: toStartDateValue }}
                    className="ons-summary__button"
                    aria-label={`Change or delete start date for questionnaire ${questionnaireName}`}
                  >
                    Change or delete start date
                  </Link>
                ) : (
                  <Link
                    to="/questionnaire/start-date"
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
                    {formatRelativeDate(toStartDateValue)}
                    )
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

export default CatiModeDetails;
