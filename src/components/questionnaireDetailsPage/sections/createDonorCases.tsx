import React, { ReactElement } from "react";
import { Questionnaire } from "blaise-api-node-client";
import { Link } from "react-router-dom";

interface Props {
    questionnaire: Questionnaire;
}

const VALID_IPS_ROLES = ["IPS Manager", "IPS Field Interviewer", "IPS Pilot Interviewer"];

function CreateDonorCases({ questionnaire }: Props): ReactElement {
    const ipsPilotQuestionnairePattern = /^IPS\d{2}00[A-Za-z]$/;
    const isIPSPilotQuestionnaire = ipsPilotQuestionnairePattern.test(questionnaire.name);

    const rolesToRender = isIPSPilotQuestionnaire
        ? ["IPS Pilot Interviewer"]
        : VALID_IPS_ROLES.filter(role => role !== "IPS Pilot Interviewer");

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
                        {rolesToRender.map((role, index) => (
                            <tbody key={index} className="ons-summary__item">
                                <tr className="ons-summary__row ons-summary__row--has-values">
                                    <td className="ons-summary__item-title">
                                        <div className="ons-summary__item--text">
                                            {role}
                                        </div>
                                    </td>
                                    <td className="ons-summary__values" colSpan={2}>
                                        <Link to="/createDonorCasesConfirmation"
                                            state={{ section: "createDonorCases", questionnaire: questionnaire, role: role }}
                                            className="ons-summary__button"
                                            aria-label={`Create donor cases for questionnaire ${questionnaire.name}`}>
                                            Create cases
                                        </Link>
                                    </td>
                                </tr>
                            </tbody>
                        ))}
                    </table>
                </div>
            </div >
        </>
    );
}

export default CreateDonorCases;
