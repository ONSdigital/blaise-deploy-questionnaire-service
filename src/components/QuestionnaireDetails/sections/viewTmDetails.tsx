import React, {ReactElement, useEffect, useState} from "react";
import {ONSLoadingPanel, ONSPanel} from "blaise-design-system-react-components";
import {getTMReleaseDate} from "../../../client/tmReleaseDate";
import dateFormatter from "dayjs";
import TimeAgo from "react-timeago";
import {Link} from "react-router-dom";

interface Props {
    questionnaireName: string
    modes: string[]
}

function ViewTmDetails({questionnaireName, modes}: Props): ReactElement {
    //TODO: change logic to filter out non-LMS questionnaire

    // if (!modes.includes("CATI")) {
    //     return <></>;
    // }

    const [loading, setLoading] = useState<boolean>(true);
    const [errored, setErrored] = useState<boolean>(false);
    const [tmReleaseDate, setTmReleaseDate] = useState<boolean>(false);
    const [tmReleaseDateValue, setTmReleaseDateValue] = useState<string>("");

    useEffect(() => {
        getTMReleaseDateForQuestionnaire().then(() => setLoading(false));
    }, []);

    async function getTMReleaseDateForQuestionnaire() {
        setLoading(true);
        try {
            const tmReleaseDate = await getTMReleaseDate(questionnaireName);
            if (tmReleaseDate == "") {
                setTmReleaseDate(false);
                return;
            }

            setTmReleaseDate(true);
            setTmReleaseDateValue(tmReleaseDate);
        } catch {
            setErrored(true);
        }
    }


    if (loading) {
        return (
            <div className="u-mb-m" aria-busy="true">
                <ONSLoadingPanel message={"Getting Totalmobile release date"}/>
            </div>
        );
    }

    if (errored) {
        return (
            <div className="u-mb-m">
                <ONSPanel status={"error"}>Failed to get Totalmobile release date</ONSPanel>
            </div>
        );
    }

    return (
        <>
            <div className="summary u-mb-m elementToFadeIn">
                <div className="summary__group">
                    <h2 className="summary__group-title">Totalmobile details</h2>
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
                                    Totalmobile release date
                                </div>
                            </td>
                            <td className="summary__values">

                                {
                                    tmReleaseDate ?
                                        <>
                                            {dateFormatter(tmReleaseDateValue).format("DD/MM/YYYY")} ({<TimeAgo
                                            live={false} date={tmReleaseDateValue}/>})
                                        </>

                                        :
                                        "No release date specified"
                                }
                            </td>
                            <td className="summary__actions">
                                {
                                    tmReleaseDate ?
                                        <Link to={{
                                            pathname: "/questionnaire/release-date",
                                            state: {questionnaireName: questionnaireName, toStartDate: tmReleaseDateValue}
                                        }} className="summary__button"
                                              aria-label={`Change or delete release date for questionnaire ${questionnaireName}`}>
                                            Change or delete release date
                                        </Link>
                                        :
                                        <Link to={{
                                            pathname: "/questionnaire/release-date",
                                            state: {questionnaireName: questionnaireName}
                                        }} className="summary__button"
                                              aria-label={`Add a release date for questionnaire ${questionnaireName}`}>
                                            Add release date
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

export default ViewTmDetails;
