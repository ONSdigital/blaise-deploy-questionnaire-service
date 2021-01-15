import React, {useState} from "react";
import {useHistory} from "react-router-dom";
import {ONSButton} from "../ONSDesignSystem/ONSButton";

interface Props {
    instrumentName: string
    UploadFile: any
    loading: boolean
}

function AlreadyExists({instrumentName, UploadFile, loading} : Props) {
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
            <h1>Questionnaire file <em className="highlight">{instrumentName}</em> already exists in the system.
            <br/>
            What action do you want to take?
            </h1>

            <p>
                {message}
            </p>

            <form onSubmit={() => confirmOption()}>
                <fieldset className="fieldset">
                    <legend className="fieldset__legend">
                    </legend>
                    <div className="radios__items">
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
                            Cancel and keep original questionnaire
                        </label>
                    </span>
                        </p>
                        <br/>
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
                            Overwrite the entire questionnaire
                        </label>
                    </span></p>
                    </div>
                </fieldset>

                <br/>
                <ONSButton
                    label={"Save"}
                    primary={true}
                    loading={loading}
                    onClick={() => confirmOption()}/>
            </form>
        </>
    );
}

export default AlreadyExists;
