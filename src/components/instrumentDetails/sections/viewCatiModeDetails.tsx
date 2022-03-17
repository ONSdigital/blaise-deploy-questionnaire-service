import React, {ReactElement, useEffect, useState} from "react";
import {ONSLoadingPanel, ONSPanel} from "blaise-design-system-react-components";
import {getTOStartDate} from "../../../client/toStartDate";
import dateFormatter from "dayjs";
import TimeAgo from "react-timeago";
import {Link} from "react-router-dom";

interface Props {
    instrumentName: string
    modes: string[]
}

function ViewCatiModeDetails({instrumentName, modes}: Props): ReactElement {
    if (!modes.includes("CATI")) {
        return <></>
    }

    const [loading, setLoading] = useState<boolean>(true);
    const [errored, setErrored] = useState<boolean>(false);
    const [toStartDate, setToStartDate] = useState<boolean>(false);
    const [toStartDateValue, setToStartDateValue] = useState<string>("");

    useEffect(() => {
        getTOStartDateForInstrument().then(() => setLoading(false));
    }, []);

    async function getTOStartDateForInstrument() {
        setLoading(true);
        try {
            const toStartDate = await getTOStartDate(instrumentName);
            if (toStartDate == "") {
                setToStartDate(false);
                return;
            }

            setToStartDate(true);
            setToStartDateValue(toStartDate);
        } catch {
            setErrored(true);
        }
    }


    if (loading) {
        return (
            <div className="u-mb-m" aria-busy="true">
                <ONSLoadingPanel message={"Getting Telephone Operations start date"}/>
            </div>
        );
    }

    if (errored) {
        return (
            <div className="u-mb-m">
                <ONSPanel status={"error"}>Failed to get Telephone Operations start date</ONSPanel>
            </div>
        );
    }

    return (
        <>
            <div className="summary u-mb-m elementToFadeIn">
                <div className="summary__group">
                    <h2 className="summary__group-title">CATI mode details</h2>
                    <table className="summary__items">
                        <thead className="u-vh">
                        <tr>
                            <th>Questionnaire detail</th>
                            <th>result</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody className="summary__item">
                        <tr className="summary__row summary__row--has-values">
                            <td className="summary__item-title">
                                <div className="summary__item--text">
                                    Telephone Operations start date
                                </div>
                            </td>
                            <td className="summary__values">

                                {
                                    toStartDate ?
                                        <>
                                            {dateFormatter(toStartDateValue).format("DD/MM/YYYY")} ({<TimeAgo
                                            live={false} date={toStartDateValue}/>})
                                        </>

                                        :
                                        "No start date specified, using survey days"
                                }
                            </td>
                            <td className="summary__actions">
                                {
                                    toStartDate ?
                                        <Link to={{
                                            pathname: "/questionnaire/start-date",
                                            state: {instrumentName: instrumentName, toStartDate: toStartDateValue}
                                        }} className="summary__button"
                                              aria-label={`Change or delete start date for questionnaire ${instrumentName}`}>
                                            Change or delete start date
                                        </Link>
                                        :
                                        <Link to={{
                                            pathname: "/questionnaire/start-date",
                                            state: {instrumentName: instrumentName}
                                        }} className="summary__button"
                                              aria-label={`Add a start date for questionnaire ${instrumentName}`}>
                                            Add start date
                                        </Link>

                                }
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default ViewCatiModeDetails;
