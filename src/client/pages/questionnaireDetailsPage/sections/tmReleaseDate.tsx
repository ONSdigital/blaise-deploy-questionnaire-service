import { useQuery } from "@tanstack/react-query";
import {
  GroupedSummary,
  LoadingPanel,
  Panel,
  SummaryGroupTable,
} from "blaise-design-system-react-components";
import dateFormatter from "dayjs";
import { type ReactElement } from "react";
import { Link } from "react-router-dom";

import { getTmReleaseDate } from "../../../api/tmReleaseDate";
import { shouldAskTmReleaseDate } from "../../../utils/deploymentDateQuestionRules";
import { formatRelativeDate } from "../../../utils/formatRelativeDate";

interface Props {
  questionnaireName: string;
}

function TmReleaseDate({ questionnaireName }: Props): ReactElement {
  const shouldShowTmReleaseDateDetails = shouldAskTmReleaseDate(questionnaireName);

  const {
    data: tmReleaseDateValue = "",
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tmReleaseDate", questionnaireName],
    queryFn: () => getTmReleaseDate(questionnaireName),
    enabled: shouldShowTmReleaseDateDetails,
  });

  const tmReleaseDate = tmReleaseDateValue !== "";

  function renderTmReleaseDate(): ReactElement | string {
    const parsedTmReleaseDate = dateFormatter(tmReleaseDateValue);

    if (!parsedTmReleaseDate.isValid()) {
      return tmReleaseDateValue;
    }

    return (
      <>
        {parsedTmReleaseDate.format("DD/MM/YYYY")} (
        {formatRelativeDate(parsedTmReleaseDate.toDate())})
      </>
    );
  }

  if (!shouldShowTmReleaseDateDetails) {
    return <></>;
  }

  if (isLoading) {
    return (
      <div
        className="ons-u-mb-m"
        aria-busy="true"
      >
        <LoadingPanel message={"Getting Totalmobile release date..."} />
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

  const releaseDateAction = tmReleaseDate ? (
    <Link
      to={`/questionnaire/${questionnaireName}/tm-release-date`}
      state={{
        questionnaireName: questionnaireName,
        tmReleaseDate: tmReleaseDateValue,
      }}
      className="ons-summary__button"
      aria-label={`Change or delete Totalmobile release date for questionnaire ${questionnaireName}`}
    >
      Change or delete release date
    </Link>
  ) : (
    <Link
      to={`/questionnaire/${questionnaireName}/tm-release-date`}
      state={{ questionnaireName: questionnaireName }}
      className="ons-summary__button"
      aria-label={`Add a Totalmobile release date for questionnaire ${questionnaireName}`}
    >
      Add release date
    </Link>
  );

  const groupedSummary = new GroupedSummary([
    {
      title: "Totalmobile details",
      records: {
        "Totalmobile release date": {
          display: (
            <>
              <span className="ons-summary__text ons-u-fw-b">
                {tmReleaseDate ? renderTmReleaseDate() : "No release date specified"}
              </span>
              <div className="ons-u-mt-m ons-u-mb-s">{releaseDateAction}</div>
            </>
          ),
          csv: tmReleaseDate ? tmReleaseDateValue : "No release date specified",
        },
      },
    },
  ]);

  return (
    <SummaryGroupTable
      className="ons-u-mb-m"
      groupedSummary={groupedSummary}
    />
  );
}

export { TmReleaseDate };
