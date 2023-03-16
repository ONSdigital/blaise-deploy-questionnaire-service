import React, { ReactElement } from "react";
import dateFormatter from "dayjs";
import QuestionnaireStatus from "../../questionnaireStatus";
import { Questionnaire } from "blaise-api-node-client";

interface Props {
    questionnaire: Questionnaire;
    modes: string[]
}

function QuestionnaireDetails({ questionnaire, modes }: Props): ReactElement {
    return (
        <>
            <div className="ons-summary ons-u-mb-m">
                <div className="ons-summary__group">
                    <h2 className="ons-summary__group-title">Questionnaire details</h2>
                    <table className="ons-summary__items">
                        <thead className="ons-u-vh">
                            <tr>
                                <th>Detail</th>
                                <th>Output</th>
                            </tr>
                        </thead>
                        <tbody className="ons-summary__item">
                            <tr className="ons-summary__row ons-summary__row--has-values">
                                <td className="ons-summary__item-title">
                                    <div className="ons-summary__item--text">
                                    Questionnaire status
                                    </div>
                                </td>
                                <td className="ons-summary__values" colSpan={2}>
                                    <QuestionnaireStatus status={questionnaire.status ? questionnaire.status : ""}/>
                                </td>
                            </tr>
                        </tbody>
                        <tbody className="ons-summary__item">
                            <tr className="ons-summary__row ons-summary__row--has-values">
                                <td className="ons-summary__item-title">
                                    <div className="ons-summary__item--text">
                                    Modes
                                    </div>
                                </td>
                                <td className="ons-summary__values" colSpan={2}>
                                    {modes.join(", ")}
                                </td>
                            </tr>
                        </tbody>
                        <tbody className="ons-summary__item">
                            <tr className="ons-summary__row ons-summary__row--has-values">
                                <td className="ons-summary__item-title">
                                    <div className="ons-summary__item--text">
                                    Number of cases
                                    </div>
                                </td>
                                <td className="ons-summary__values" colSpan={2}>
                                    {questionnaire.dataRecordCount}
                                </td>
                            </tr>
                        </tbody>
                        <tbody className="ons-summary__item">
                            <tr className="ons-summary__row ons-summary__row--has-values">
                                <td className="ons-summary__item-title">
                                    <div className="ons-summary__item--text">
                                    Install date
                                    </div>
                                </td>
                                <td className="ons-summary__values" colSpan={2}>
                                    {dateFormatter(questionnaire.installDate).format("DD/MM/YYYY HH:mm")}
                                </td>
                            </tr>
                        </tbody>
                        <tbody className="ons-summary__item">
                            <tr className="ons-summary__row ons-summary__row--has-values">
                                <td className="ons-summary__item-title">
                                    <div className="ons-summary__item--text">
                                    Blaise version
                                    </div>
                                </td>
                                <td className="ons-summary__values" colSpan={2}>
                                    {questionnaire.blaiseVersion}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default QuestionnaireDetails;
