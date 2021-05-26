import React, {ReactElement, useState} from "react";
import {Link, Redirect, useHistory, useLocation} from "react-router-dom";
import {ONSButton, ONSPanel} from "blaise-design-system-react-components";
import {Instrument} from "../../../Interfaces";
import ErroneousWarning from "./ErroneousWarning";
import {deleteInstrument} from "../../utilities/http";

interface Props {
    getList: () => void
}

interface Location {
    state: {
        instrument: Instrument
    }
}

function DeleteConfirmation({getList}: Props): ReactElement {
    const [confirm, setConfirm] = useState<boolean | null>(null);
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [redirect, setRedirect] = useState<boolean>(false);
    const [formError, setFormError] = useState<string>("");
    const history = useHistory();
    const location = useLocation();
    const {instrument} = (location as Location).state || {instrument: ""};

    async function confirmDelete() {
        setLoading(true);

        const [deleted, message] = await deleteInstrument(instrument.name);
        if (!deleted) {
            setMessage("Failed to delete questionnaire");
            setLoading(false);
            return;
        }

        getList();
        setMessage(`Questionnaire: ${instrument.name} Successfully deleted`);
        setLoading(false);
        setRedirect(true);
    }

    async function cancelDelete() {
        setRedirect(true);
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

            {
                (
                    instrument.status === "Erroneous" ?
                        <ErroneousWarning instrumentName={instrument.name} setRedirect={setRedirect}/>
                        :
                        <>
                            <h1>
                                Are you sure you want to delete the questionnaire <em
                                className="highlight">{instrument.name}</em>?
                            </h1>
                            <div className="panel panel--warn panel--no-title">
                                <span className="panel__icon" aria-hidden="true">!</span>
                                <span className="u-vh">Warning: </span>
                                <div className="panel__body">
                                    The questionnaire and all associated respondent data will be deleted 
                                </div>
                            </div>

                            <p>
                                {message}
                            </p>

                            <form>
                                <br/>
                                <ONSButton
                                    label={"Delete"}
                                    primary={true}
                                    loading={loading}
                                    id="confirm-delete"
                                    testid="confirm-delete"
                                    onClick={() => confirmDelete()}/>
                                {!loading &&
                                <ONSButton
                                    label={"Cancel"}
                                    primary={false}
                                    id="cancel-delete"
                                    testid="cancel-delete"
                                    onClick={() => cancelDelete()}/>
                                }
                            </form>
                        </>
                )
            }
        </>
    );
}

export default DeleteConfirmation;
