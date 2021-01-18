import React, {useState} from "react";
import {useHistory} from "react-router-dom";
import {ONSButton} from "../ONSDesignSystem/ONSButton";

interface Props {
    instrumentName: string
    UploadFile: any
    loading: boolean
}

function Confirmation({instrumentName, UploadFile, loading}: Props) {
    const [confirm, setConfirm] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const history = useHistory();

    function confirmOption() {

        if (!confirm) {
            history.push("/");
            return;
        }
        UploadFile();
    }

    return (
        <>
            <h1>
                Are you sure you want to overwrite the entire questionnaire <em
                className="highlight">{instrumentName}</em>?
            </h1>

            <p>
                {message}
            </p>

            <div className="panel panel--warn panel--no-title">
                <span className="panel__icon" aria-hidden="true">!</span>
                <div className="panel__body">
                    All existing questionnaire information will be deleted
                </div>
            </div>

            <form onSubmit={() => confirmOption()}>
                <fieldset className="fieldset">
                    <legend className="fieldset__legend">
                    </legend>
                    <div className="radios__items">

                        <p className="radios__item">
                        <span className="radio">
                        <input
                            type="radio"
                            id="confirm-overwrite"
                            className="radio__input js-radio "
                            value="True"
                            name="confirm-delete"
                            aria-label="No"
                            onChange={() => setConfirm(true)}
                        />
                        <label className="radio__label " htmlFor="confirm-overwrite">
                            Yes, overwrite questionnaire
                        </label>
                    </span></p>
                           <br/>
                        <p className="radios__item">
                        <span className="radio">
                        <input
                            type="radio"
                            id="cancel-keep"
                            className="radio__input js-radio "
                            value="False"
                            name="confirm-delete"
                            aria-label="Yes"
                            onChange={() => setConfirm(false)}
                        />
                        <label className="radio__label " htmlFor="cancel-keep">
                            No, do not overwrite questionnaire
                        </label>
                    </span>
                        </p>
                    </div>
                </fieldset>

                <br/>
                <ONSButton
                    label={"Continue"}
                    primary={true}
                    loading={loading}
                    onClick={() => confirmOption()}/>
                {!loading &&
                <ONSButton
                    label={"Cancel"}
                    primary={false}
                    onClick={() => confirmOption()}/>
                }
            </form>
        </>
    );
}

export default Confirmation;
