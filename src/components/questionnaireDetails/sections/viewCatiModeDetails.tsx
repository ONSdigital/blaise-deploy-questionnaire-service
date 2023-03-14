import React, { ReactElement, useEffect, useState } from "react";
import { ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import { getTOStartDate } from "../../../client/toStartDate";
import dateFormatter from "dayjs";
import TimeAgo from "react-timeago";
import { Link } from "react-router-dom";

interface Props {
    questionnaireName: string
    modes: string[]
}

function ViewCatiModeDetails({ questionnaireName, modes }: Props): ReactElement {
    if (!modes.includes("CATI")) {
        return <></>;
    }

    const [loading, setLoading] = useState<boolean>(true);
    const [errored, setErrored] = useState<boolean>(false);
    const [toStartDate, setToStartDate] = useState<boolean>(false);
    const [toStartDateValue, setToStartDateValue] = useState<string>("");

    useEffect(() => {
        getTOStartDateForQuestionnaire().then(() => setLoading(false));
    }, []);

    async function getTOStartDateForQuestionnaire() {
        setLoading(true);
        try {
            const toStartDate = await getTOStartDate(questionnaireName);
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
            <div className="ons-u-mb-m" aria-busy="true">
                <ONSLoadingPanel message={"Getting Telephone Operations start date"}/>
            </div>
        );
    }

    if (errored) {
        return (
            <div className="ons-u-mb-m">
                <ONSPanel status={"error"}>Failed to get Telephone Operations start date</ONSPanel>
            </div>
        );
    }

    return (
        <>
            <div className="ons-summary ons-u-mb-m elementToFadeIn">
                <div className="ons-summary__group">
                    <h2 className="ons-summary__group-title">CATI mode details</h2>
                    <table className="ons-summary__items">
                        <thead className="ons-u-vh">
                            <tr>
                                <th>Questionnaire detail</th>
                                <th>result</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody className="ons-summary__item">
                            <tr className="ons-summary__row ons-summary__row--has-values">
                                <td className="ons-summary__item-title">
                                    <div className="ons-summary__item--text">
                                    Telephone Operations start date
                                    </div>
                                </td>
                                <td className="ons-summary__values">

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
                                <td className="ons-summary__actions">
                                    {
                                        toStartDate ?
                                            <Link to={{
                                                pathname: "/questionnaire/start-date",
                                                state: { questionnaireName: questionnaireName, toStartDate: toStartDateValue }
                                            }} className="ons-summary__button"
                                            aria-label={`Change or delete start date for questionnaire ${questionnaireName}`}>
                                            Change or delete start date
                                            </Link>
                                            :
                                            <Link to={{
                                                pathname: "/questionnaire/start-date",
                                                state: { questionnaireName: questionnaireName }
                                            }} className="ons-summary__button"
                                            aria-label={`Add a start date for questionnaire ${questionnaireName}`}>
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
