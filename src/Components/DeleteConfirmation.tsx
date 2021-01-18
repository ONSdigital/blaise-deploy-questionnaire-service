import React, {ReactElement, useState} from "react";
import {Link, Redirect, useHistory, useParams} from "react-router-dom";
import {ONSButton} from "./ONSDesignSystem/ONSButton";

interface Params {
    instrumentName: string
}

interface Props {
    getList: () => void
}

function DeleteConfirmation({getList}: Props): ReactElement {
    const [confirm, setConfirm] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [redirect, setRedirect] = useState<boolean>(false);
    const history = useHistory();
    const {instrumentName}: Params = useParams();

    function confirmOption(): void{
        if (!confirm) {
            history.push("/");
            return;
        }

        setLoading(true);

        deleteInstrument()
            .then(async () => {
                getList();
                setMessage(`Questionnaire: ${instrumentName} Successfully deleted`);
                setLoading(false);
                setRedirect(true);
            })
            .catch((error) => {
                console.error(error, "Error");
                setMessage("Failed to delete questionnaire");
                setLoading(false);
            });
    }

    function deleteInstrument() {
        console.log("Sending request to delete questionnaire");
        return new Promise((resolve: any, reject: any) => {
            fetch(`/api/instruments/${instrumentName}`, {method: "DELETE"})
                .then((r: Response) => {
                    if (r.status === 204) {
                        resolve(true);
                    } else {
                        throw r.status + " - " + r.statusText;
                    }
                })
                .catch(async (error) => {
                    console.error("Failed to delete questionnaire, error: " + error);
                    reject(error);
                });
        });
    }

    return (
        <>
            {
                redirect && <Redirect
                    to={{
                        pathname: "/",
                        state: {status: message}
                    }}/>
            }
            <p>
                <Link to={"/"}>Previous</Link>
            </p>
            <h1>
                Are you sure you want to delete the questionnaire <em className="highlight">{instrumentName}</em>?
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
                            id="confirm-delete"
                            className="radio__input js-radio "
                            value="True"
                            name="confirm-radio-delete"
                            aria-label="Yes"
                            onChange={() => setConfirm(true)}
                        />
                        <label className="radio__label " htmlFor="confirm-delete">
                            Yes, delete questionnaire
                        </label>
                    </span></p>
                        <br/>
                        <p className="radios__item">
                        <span className="radio">
                        <input
                            type="radio"
                            id="cancel-delete"
                            className="radio__input js-radio "
                            value="False"
                            name="confirm-radio-delete"
                            aria-label="No"
                            onChange={() => setConfirm(false)}
                        />
                        <label className="radio__label " htmlFor="cancel-delete">
                            No, do not delete questionnaire
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
                    id="confirm-delete"
                    onClick={() => confirmOption()}/>
                {!loading &&
                <ONSButton
                    label={"Cancel"}
                    primary={false}
                    id="cancel-delete"
                    onClick={() => confirmOption()}/>
                }
            </form>
        </>
    );
}

export default DeleteConfirmation;
