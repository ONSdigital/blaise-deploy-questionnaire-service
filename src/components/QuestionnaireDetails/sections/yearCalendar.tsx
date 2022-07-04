import React, { ReactElement, useState } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Calendar, CalendarControls } from "react-yearly-calendar";
import "./yearCalendar.css";
import dateFormatter from "dayjs";

interface Props {
    modes: string[]
    surveyDays?: string[]
}

function YearCalendar({ modes, surveyDays }: Props): ReactElement {
    if (! modes.includes("CATI")) {
        return <></>;
    }

    if (surveyDays === undefined) {
        surveyDays = [];
    }

    surveyDays = surveyDays.map((item) => dateFormatter(item).format("YYYY-MM-DD"));
    const [year, setYear] = useState<number>(parseInt(dateFormatter(surveyDays[surveyDays.length - 1]).format("YYYY")));

    const customStyling = {
        holidays: surveyDays
    };

    function onPrevYear() {
        setYear(year - 1);
    }

    function onNextYear() {
        setYear(year + 1);
    }

    return (
        <>
            <h2 className={"u-mt-m"}>Survey days</h2>
            <CalendarControls
                year={year}
                onPrevYear={() => onPrevYear()}
                onNextYear={() => onNextYear()}
            />
            <Calendar
                firstDayOfWeek={1}
                year={year}
                customClasses={customStyling}
            />
        </>
    );
}

export default YearCalendar;
