import React, { ReactElement, useState } from "react";
import { Questionnaire } from "blaise-api-node-client";
import { useNavigate } from "react-router-dom";
import { ONSButton, ONSPanel } from "blaise-design-system-react-components";
import FindUserComponent from "./findUserComponent";

interface Props {
    questionnaire: Questionnaire;
}

function ReissueNewDonorCase({ questionnaire }: Props): ReactElement {
    const [user, setUser] = useState("");
    const [error, setError] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const roles: string[] = ["IPS Field Interviewer", "IPS Manager", "IPS Pilot Interviewer"];

    function onSetUser(user: string) {
        setUser(user);
        if(user.trim().length > 0){
            setError(false);
            setErrorMessage("");
        }
        else
        {
            setError(true);
        }
    }

    function onError(message: string) {
        setErrorMessage(message);
        setError(true);
    }

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
                    <ONSPanel>
                        To assign a new donor case to an interviewer who already has one, select their username and click <b>Reissue Donor Case</b>.
                    </ONSPanel>
                    <table className="ons-summary__items">
                        <tbody>
                            <tr className="ons-summary__row ons-summary__row--has-values">
                                <td className="ons-summary__item-title">
                                    <div className="ons-summary__item--text">
                                        <div className="ons-field">
                                            <FindUserComponent label="Enter Username" onItemSelected={onSetUser} onError={onError} roles={roles} />
                                        </div>
                                        <div className="ons-field ons-input--text">
                                            {errorMessage &&
                                                <ONSPanel status="error">
                                                    <p className="">
                                                        {errorMessage}
                                                    </p>
                                                </ONSPanel>}
                                        </div>
                                    </div>
                                </td>
                                <td className="ons-summary__values" colSpan={1} rowSpan={1}>
                                    <br />
                                    <ONSButton
                                        label="Reissue Donor Case"
                                        primary={false}
                                        disabled={error}
                                        onClick={reissueNewDonorCaseButtonClicked}
                                    />
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
