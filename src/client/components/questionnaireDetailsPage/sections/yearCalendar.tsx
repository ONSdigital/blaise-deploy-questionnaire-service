import dateFormatter from "dayjs";
import React, { type ReactElement, useMemo, useState } from "react";
import "./yearCalendar.css";

interface Props {
  modes: string[];
  surveyDays?: string[];
}

const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

function YearCalendar({ modes, surveyDays }: Props): ReactElement {
  const isCatiQuestionnaire = modes.includes("CATI");

  const validSurveyDays = (surveyDays || [])
    .map((item) => dateFormatter(item))
    .filter((date) => date.isValid());

  const highlightedSurveyDays = useMemo(
    () => new Set(validSurveyDays.map((date) => date.format("YYYY-MM-DD"))),
    [validSurveyDays],
  );

  const initialYear =
    validSurveyDays.length > 0
      ? Math.max(...validSurveyDays.map((date) => date.year()))
      : dateFormatter().year();

  const [year, setYear] = useState<number>(initialYear);

  function onPrevYear() {
    setYear(year - 1);
  }

  function onNextYear() {
    setYear(year + 1);
  }

  if (!isCatiQuestionnaire) {
    return <></>;
  }

  const maxCells = Math.max(
    ...Array.from({ length: 12 }, (_, m) => {
      const ms = dateFormatter().year(year).month(m).date(1);

      return ((ms.day() + 6) % 7) + ms.daysInMonth();
    }),
  );

  const fullWeeks = Math.floor(maxCells / 7);
  const partialDays = maxCells % 7;
  const weekCount = fullWeeks + 1;

  function buildHeaderCells(): ReactElement[] {
    const headers: ReactElement[] = [];

    for (let w = 0; w < weekCount; w++) {
      if (w > 0) {
        headers.push(
          <th
            key={`sep-${w}`}
            className="week-separator"
          ></th>,
        );
      }

      const daysInWeek = w < fullWeeks ? 7 : partialDays;

      for (let d = 0; d < daysInWeek; d++) {
        headers.push(<th key={`w${w}d${d}`}>{WEEKDAY_LETTERS[d]}</th>);
      }
    }

    return headers;
  }

  function renderMonthRow(monthIndex: number): ReactElement {
    const monthStart = dateFormatter().year(year).month(monthIndex).date(1);
    const daysInMonth = monthStart.daysInMonth();
    const offset = (monthStart.day() + 6) % 7;
    const monthLabel = monthStart.format("MMM");

    const cells: ReactElement[] = [];
    let cellIndex = 0;

    for (let w = 0; w < weekCount; w++) {
      if (w > 0) {
        cells.push(
          <td
            key={`sep-${monthLabel}-${w}`}
            className="week-separator"
          ></td>,
        );
      }

      const daysInWeek = w < fullWeeks ? 7 : partialDays;

      for (let d = 0; d < daysInWeek; d++) {
        const classNames: string[] = [];

        if (cellIndex < offset) {
          cells.push(
            <td
              key={`pm-${monthLabel}-${cellIndex}`}
              className={["prev-month", ...classNames].join(" ")}
            >
              <span className="day-number"></span>
            </td>,
          );
        } else if (cellIndex < offset + daysInMonth) {
          const day = cellIndex - offset + 1;
          const isoDate = dateFormatter()
            .year(year)
            .month(monthIndex)
            .date(day)
            .format("YYYY-MM-DD");
          const isSurveyDay = highlightedSurveyDays.has(isoDate);

          if (isSurveyDay) classNames.push("holidays");

          cells.push(
            <td
              key={isoDate}
              className={classNames.length > 0 ? classNames.join(" ") : undefined}
            >
              <span className="day-number">{day}</span>
            </td>,
          );
        } else {
          cells.push(
            <td
              key={`nm-${monthLabel}-${cellIndex}`}
              className={["next-month", ...classNames].join(" ")}
            >
              <span className="day-number"></span>
            </td>,
          );
        }

        cellIndex++;
      }
    }

    return (
      <tr key={monthLabel}>
        <td className="month-name">{monthLabel}</td>
        {cells}
      </tr>
    );
  }

  return (
    <>
      <h2 className={"ons-u-mt-m"}>Survey days</h2>
      <div
        className="calendar-controls"
        role="group"
        aria-label="Survey days year controls"
      >
        <button
          type="button"
          className="control"
          onClick={() => onPrevYear()}
          aria-label="Previous year"
        >
          &laquo;
        </button>
        <div className="current-year">{year}</div>
        <button
          type="button"
          className="control"
          onClick={() => onNextYear()}
          aria-label="Next year"
        >
          &raquo;
        </button>
      </div>
      <div className="year-calendar-single">
        <table className="calendar">
          <thead className="day-headers">
            <tr>
              <th>&nbsp;</th>
              {buildHeaderCells()}
            </tr>
          </thead>
          <tbody>{Array.from({ length: 12 }, (_, monthIndex) => renderMonthRow(monthIndex))}</tbody>
        </table>
      </div>
    </>
  );
}

export { YearCalendar };
