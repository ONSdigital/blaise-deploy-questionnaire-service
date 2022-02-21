import React, { ReactElement, useState } from "react";
import { Redirect, useLocation } from "react-router-dom";
import { ONSButton, ONSPanel } from "blaise-design-system-react-components";
import { Instrument } from "blaise-api-node-client";
import ErroneousWarning from "./erroneousWarning";
import { removeToStartDateAndDeleteInstrument } from "../../utilities/processes";
import Breadcrumbs from "../breadcrumbs";


interface Location {
    instrument: Instrument
}

type Props = {
    setStatus: (status: string) => void
}

function DeleteConfirmation({ setStatus }: Props): ReactElement {
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [redirect, setRedirect] = useState<boolean>(false);
    const location = useLocation<Location>();
    const { instrument } = location.state || { instrument: "" };

    async function confirmDelete() {
        setLoading(true);

        const [deleted, message] = await removeToStartDateAndDeleteInstrument(instrument.name);
        if (!deleted) {
            setMessage(message);
            setLoading(false);
            return;
        }

        setStatus(`Questionnaire: ${instrument.name} Successfully deleted`);
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
                        pathname: "/"
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
