import React, {ReactElement, useState} from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {Calendar} from "react-yearly-calendar";
import "./styles.css";
import dateFormatter from "dayjs";

interface Props {
    surveyDays: string[] | undefined
}
function CalendarSection({surveyDays}: Props) {

    if (surveyDays === undefined) {
        surveyDays = [];
    }

    surveyDays = surveyDays.map((item) => dateFormatter(item).format("YYYY-MM-DD"));
    const year = parseInt(dateFormatter(surveyDays[surveyDays.length -1 ] ).format("YYYY"));

    const customCSSclasses = {
        holidays: surveyDays,
        spring: {
            start: "2021-03-21",
            end: "2021-6-20"
        },
        summer: {
            start: "2021-06-21",
            end: "2021-09-22"
        },
        autumn: {
            start: "2021-09-23",
            end: "2021-12-21"
        },
        weekend: "Sat,Sun",
    };

    return(
        <Calendar
            year={year}
            customClasses={customCSSclasses}
        />
    );
}

export default CalendarSection;
