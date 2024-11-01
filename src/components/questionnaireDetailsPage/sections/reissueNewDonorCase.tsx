import React, { ReactElement, useState } from "react";
import { Questionnaire } from "blaise-api-node-client";
import { useNavigate } from "react-router-dom";
import { ONSButton } from "blaise-design-system-react-components";

interface Props {
    questionnaire: Questionnaire;
}

function ReissueNewDonorCase({ questionnaire }: Props): ReactElement {
    const [user, setUser] = useState("");
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    function reissueNewDonorCaseButtonClicked() {
        const trimmedUser = user.trim();
        setUser(trimmedUser);

        // Check if input is empty after trimming
        if (trimmedUser === "") {
            setErrorMessage("User input cannot be empty or contain only spaces");
            setError(true);
        } else {
            setError(false);
            setErrorMessage("");
            navigate("/reissueNewDonorCaseConfirmation", { state: { section: "reissueNewDonorCase", questionnaire: questionnaire, user: trimmedUser } });
        }
    }

    return (
        <>
            <div className="ons-summary ons-u-mb-m">
                <div className="ons-summary__group">
                    <h2 className="ons-summary__group-title">Reissue New Donor Case</h2>
                    <table className="ons-summary__items">
                        <tbody className="ons-summary__item">
                            <tr className="ons-summary__row ons-summary__row--has-values">
                                <td className="ons-summary__item-title">
                                    <div className="ons-summary__item--text">
                                        <div className="ons-field">
                                            <label className="ons-label" htmlFor="user">
                                                User to issue new donor case for
                                            </label>
                                            <input type="text" id="user" className="ons-input ons-input--text ons-input-type__input" value={user} onChange={(e) => setUser(e.target.value)}/>
                                        </div>
                                    </div>
                                </td>
                                <td className="ons-summary__values" colSpan={2} rowSpan={2}>
                                    <br/>
                                    <ONSButton
                                        label="Reissue Donor Case"
                                        primary={false}
                                        onClick={reissueNewDonorCaseButtonClicked}
                                    />
                                </td>
                            </tr>
                            {error && <p className="ons-summary__item--error">{errorMessage}</p>}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default ReissueNewDonorCase;
