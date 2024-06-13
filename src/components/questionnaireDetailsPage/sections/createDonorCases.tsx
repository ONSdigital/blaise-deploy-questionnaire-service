import React, { ReactElement } from "react";
import dateFormatter from "dayjs";
import QuestionnaireStatus from "../../questionnaireStatus";
import { Questionnaire } from "blaise-api-node-client";
import { Link } from "react-router-dom";

interface Props {
    questionnaire: Questionnaire;
}

function CreateDonorCases({ questionnaire }: Props): ReactElement {
    return (
        <>
            <div className="ons-summary ons-u-mb-m">
                <div className="ons-summary__group">
                    <h2 className="ons-summary__group-title">Donor Cases</h2>
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
                                        IPS Manager
                                    </div>
                                </td>
                                <td className="ons-summary__values" colSpan={2}>
                                    <Link to="/createDonorCasesConfirmation"
                                        state={{ questionnaire: questionnaire, role: "IPS Manager" }}
                                        className="ons-summary__button"
                                        aria-label={`Create donor cases for questionnaire ${questionnaire.name}`}>
                                        Create cases
                                    </Link>
                                </td>
                            </tr>
                        </tbody>
                        <tbody className="ons-summary__item">
                            <tr className="ons-summary__row ons-summary__row--has-values">
                                <td className="ons-summary__item-title">
                                    <div className="ons-summary__item--text">
                                        IPS Field Interviewer
                                    </div>
                                </td>
                                <td className="ons-summary__values" colSpan={2}>
                                    <Link to="/createDonorCasesConfirmation"
                                        state={{ questionnaire: questionnaire, role: "IPS Field Interviewer" }}
                                        className="ons-summary__button"
                                        aria-label={`Create donor cases for questionnaire ${questionnaire.name}`}>
                                        Create cases
                                    </Link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div >
        </>
    );
}

export default CreateDonorCases;
