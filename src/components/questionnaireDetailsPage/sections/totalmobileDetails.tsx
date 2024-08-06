import React, { ReactElement, useEffect, useState } from "react";
import { ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import { getTMReleaseDate } from "../../../client/tmReleaseDate";
import dateFormatter from "dayjs";
import TimeAgo from "react-timeago";
import { Link } from "react-router-dom";
import { totalmobileReleaseDateSurveyTLAs } from "../../../utilities/totalmobileReleaseDateSurveyTLAs";

interface Props {
    questionnaireName: string
}

function TotalmobileDetails({ questionnaireName }: Props): ReactElement {
    if (!totalmobileReleaseDateSurveyTLAs.some(tla => questionnaireName.includes(tla))) {
        return <></>;
    }

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
            <div className="ons-u-mb-m" aria-busy="true">
                <ONSLoadingPanel message={"Getting Totalmobile release date"} />
            </div>
        );
    }

    if (errored) {
        return (
            <div className="ons-u-mb-m">
                <ONSPanel status={"error"}>Failed to get Totalmobile release date</ONSPanel>
            </div>
        );
    }

    return (
        <>
            <div className="ons-summary ons-u-mb-m elementToFadeIn">
                <div className="ons-summary__group">
                    <h2 className="ons-summary__group-title">Totalmobile details</h2>
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
                                        Totalmobile release date
                                    </div>
                                </td>
                                <td className="ons-summary__values">

                                    {
                                        tmReleaseDate ?
                                            <>
                                                {dateFormatter(tmReleaseDateValue).format("DD/MM/YYYY")} ({<TimeAgo
                                                    live={false} date={tmReleaseDateValue} />})
                                            </>

                                            :
                                            "No release date specified"
                                    }
                                </td>
                                <td className="ons-summary__actions">
                                    {
                                        tmReleaseDate ?
                                            <Link to="/questionnaire/release-date"
                                                state={{ questionnaireName: questionnaireName, tmReleaseDate: tmReleaseDateValue }}
                                                className="ons-summary__button"
                                                aria-label={`Change or delete release date for questionnaire ${questionnaireName}`}>
                                                Change or delete release date
                                            </Link>
                                            :
                                            <Link to="/questionnaire/release-date"
                                                state={{ questionnaireName: questionnaireName }}
                                                className="ons-summary__button"
                                                aria-label={`Add a release date for questionnaire ${questionnaireName}`}>
                                                Add release date
                                            </Link>

                                    }
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div >
        </>
    );
}

export default TotalmobileDetails;
