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

  const startDateAction = toStartDate ? (
    <Link
      to={`/questionnaire/${questionnaireName}/to-start-date`}
      state={{ questionnaireName: questionnaireName, toStartDate: toStartDateValue }}
      className="ons-summary__button"
      aria-label={`Change or delete Telephone Operations start date for questionnaire ${questionnaireName}`}
    >
      Change or delete start date
    </Link>
  ) : (
    <Link
      to={`/questionnaire/${questionnaireName}/to-start-date`}
      state={{ questionnaireName: questionnaireName }}
      className="ons-summary__button"
      aria-label={`Add a Telephone Operations start date for questionnaire ${questionnaireName}`}
    >
      Add start date
    </Link>
  );

  const startDateValue = toStartDate ? (
    <>
      {dateFormatter(toStartDateValue).format("DD/MM/YYYY")} ({formatRelativeDate(toStartDateValue)}
      )
    </>
  ) : (
    "No start date specified, using survey days"
  );
  const startDateCsvValue = toStartDate
    ? dateFormatter(toStartDateValue).format("DD/MM/YYYY")
    : "No start date specified, using survey days";

  const groupedSummary = new GroupedSummary([
    {
      title: "CATI mode details",
      records: {
        "Telephone Operations start date": {
          display: (
            <>
              <span className="ons-summary__text ons-u-fw-b">{startDateValue}</span>
              <div className="ons-u-mt-m ons-u-mb-s">{startDateAction}</div>
            </>
          ),
          csv: startDateCsvValue,
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

export { CatiModeDetails };
