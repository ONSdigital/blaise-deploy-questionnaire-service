import React, {ReactElement} from "react";
import {Redirect, useLocation} from "react-router-dom";
import dateFormatter from "dayjs";
import {Instrument} from "../../../Interfaces";
import Breadcrumbs from "../Breadcrumbs";
import InstrumentStatus from "../InstrumentStatus";
import BlaiseNodeInfo from "./Sections/BlaiseNodeInfo";
import ViewWebModeDetails from "./Sections/ViewWebModeDetails";
import ViewToStartDate from "./Sections/ViewToStartDate";
import YearCalendar from "./Sections/YearCalendar";

interface State {
    instrument: Instrument | null;
}

interface Location {
    state: State;
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
            <Breadcrumbs BreadcrumbList={
                [
                    {link: "/", title: "Home"},
                ]
            }/>

            <main id="main-content" className="page__main u-mt-no">
                <h1 className="u-mb-l">
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
                                    <InstrumentStatus status={instrument.status ? instrument.status : ""}/>
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

                <ViewWebModeDetails instrument={instrument}/>

                <h2 className={"u-mt-m"}>Survey days</h2>
                <YearCalendar surveyDays={instrument.surveyDays}/>

                <BlaiseNodeInfo instrument={instrument}/>
            </main>
        </>
    );
}

export default InstrumentDetails;

