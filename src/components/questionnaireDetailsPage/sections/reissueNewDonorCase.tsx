import React, { ReactElement, useState } from "react";
import { Questionnaire } from "blaise-api-node-client";
import { Link } from "react-router-dom";

interface Props {
    questionnaire: Questionnaire;
}

function ReissueNewDonorCase({ questionnaire }: Props): ReactElement {
    const [username, setUsername] = useState("");

    return (
        <>
            <div className="ons-summary ons-u-mb-m">
                <div className="ons-summary__group">
                    <h2 className="ons-summary__group-title">Reissue New Donor Case for User</h2>
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
                                        <label htmlFor="username">Enter Username:</label>
                                        <input
                                            type="text"
                                            id="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Username"
                                        />
                                    </div>
                                </td>
                                <td className="ons-summary__values" colSpan={2}>
                                    <Link
                                        to="/reissueNewDonorCaseConfirmation"
                                        state= {{
                                            questionnaire: questionnaire,
                                            role: username
                                        }}
                                        className="ons-summary__button"
                                        aria-label={`Reissue new donor case for questionnaire ${questionnaire.name} on behalf of username ${username}`}
                                    >
                                        Reissue Donor case
                                    </Link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default ReissueNewDonorCase;
