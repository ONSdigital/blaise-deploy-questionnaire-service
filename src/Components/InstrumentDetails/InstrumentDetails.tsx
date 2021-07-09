import React, {ReactElement} from "react";
import {Link, Redirect, useLocation} from "react-router-dom";
import YearCalendar from "./YearCalendar";
import dateFormatter from "dayjs";
import ViewToStartDate from "./ViewToStartDate";
import {Instrument} from "../../../Interfaces";
import InstrumentStatus from "../InstrumentStatus";

interface State {
    instrument: Instrument | null
}

interface Location {
    state: State
}

function InstrumentDetails(): ReactElement {
    const location = useLocation();
    const {instrument} = (location as Location).state || {instrument: null};

    if (instrument === null) {
        // No instrument provided so return users to the homepage
        return (<Redirect to={"/"}/>);
    }

    return (
        <>
            <p>
                <Link to={"/"}>Previous</Link>
            </p>
            <h1>
                {instrument.name}
            </h1>

            <ViewToStartDate instrumentName={instrument.name}/>

            <dl className="metadata metadata__list grid grid--gutterless u-cf u-mb-l"
                title="Questionnaire details"
                aria-label="Questionnaire details">
                <dt className="metadata__term grid__col col-3@m">Questionnaire status:</dt>
                <dd className="metadata__value grid__col col-8@m"><InstrumentStatus status={instrument.status ? instrument.status: ""}/></dd>
                <dt className="metadata__term grid__col col-3@m">Number of cases:</dt>
                <dd className="metadata__value grid__col col-8@m">{instrument.dataRecordCount}</dd>
                <dt className="metadata__term grid__col col-3@m">Install date:</dt>
                <dd className="metadata__value grid__col col-8@m">{dateFormatter(instrument.installDate).format("DD/MM/YYYY")}</dd>
            </dl>

            <h2>Survey days</h2>
            <YearCalendar surveyDays={instrument.surveyDays}/>
        </>
    );
}

export default InstrumentDetails;
