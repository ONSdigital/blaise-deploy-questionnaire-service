import React, { ReactElement, useState } from "react";
import { Redirect, useLocation } from "react-router-dom";
import { ONSButton, ONSPanel } from "blaise-design-system-react-components";
import { Instrument } from "../../../Interfaces";
import ErroneousWarning from "./ErroneousWarning";
import { removeToStartDateAndDeleteInstrument } from "../../utilities/processes";
import Breadcrumbs from "../Breadcrumbs";

interface Props {
    getList: () => Promise<void>;
}

interface Location {
    state: {
        instrument: Instrument
    };
}

function DeleteConfirmation({ getList }: Props): ReactElement {
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [redirect, setRedirect] = useState<boolean>(false);
    const location = useLocation();
    const { instrument } = (location as Location).state || { instrument: "" };

    async function confirmDelete() {
        setLoading(true);

        const [deleted, message] = await removeToStartDateAndDeleteInstrument(instrument.name);
        if (!deleted) {
            setMessage(message);
            setLoading(false);
            return;
        }

        await getList();
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
                        state: { status: message }
                    }} />
            }
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" },
                ]
            } />

            <main id="main-content" className="page__main u-mt-no">
                {
                    (
                        instrument.status === "Failed" ?
                            <ErroneousWarning instrumentName={instrument.name} setRedirect={setRedirect} />
                            :
                            <>
                                <h1 className="u-mb-l">
                                    Are you sure you want to delete the questionnaire <em
                                        className="highlight">{instrument.name}</em>?
                                </h1>
                                <ONSPanel status={"warn"}>
                                    The questionnaire and all associated respondent data will be deleted
                                </ONSPanel>

                                <p>
                                    {message}
                                </p>

                                <form>
                                    <br />
                                    <ONSButton
                                        label={"Delete"}
                                        primary={true}
                                        loading={loading}
                                        id="confirm-delete"
                                        testid="confirm-delete"
                                        onClick={() => confirmDelete()} />
                                    {!loading &&
                                        <ONSButton
                                            label={"Cancel"}
                                            primary={false}
                                            id="cancel-delete"
                                            testid="cancel-delete"
                                            onClick={() => cancelDelete()} />
                                    }
                                </form>
                            </>
                    )
                }
            </main>
        </>
    );
}

export default DeleteConfirmation;
