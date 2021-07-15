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

            <div className="summary u-mb-m">
                <div className="summary__group">
                    <h2 className="summary__group-title">Questionnaire details</h2>
                    <table className="summary__items">
                        <thead className="u-vh">
                        <tr>
                            <th>Detail</th>
                            <th>Output</th>
                        </tr>
                        </thead>
                        <tbody className="summary__item">
                        <tr className="summary__row summary__row--has-values">
                            <td className="summary__item-title">
                                <div className="summary__item--text">
                                    Questionnaire status
                                </div>
                            </td>
                            <td className="summary__values" colSpan={2}>
                                <InstrumentStatus status={instrument.status ? instrument.status: ""}/>
                            </td>
                        </tr>
                        </tbody>
                        <tbody className="summary__item">
                        <tr className="summary__row summary__row--has-values">
                            <td className="summary__item-title">
                                <div className="summary__item--text">
                                    Number of cases
                                </div>
                            </td>
                            <td className="summary__values" colSpan={2}>
                                {instrument.dataRecordCount}
                            </td>
                        </tr>
                        </tbody>
                        <tbody className="summary__item">
                        <tr className="summary__row summary__row--has-values">
                            <td className="summary__item-title">
                                <div className="summary__item--text">
                                    Install date
                                </div>
                            </td>
                            <td className="summary__values" colSpan={2}>
                                {dateFormatter(instrument.installDate).format("DD/MM/YYYY HH:mm")}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <h2>Survey days</h2>
            <YearCalendar surveyDays={instrument.surveyDays}/>
        </>
    );
}

export default InstrumentDetails;
