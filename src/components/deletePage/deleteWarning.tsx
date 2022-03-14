import { ONSButton, ONSPanel } from "blaise-design-system-react-components";
import React, { ReactElement, useState } from "react";
import { useHistory } from "react-router-dom";
import { Instrument, surveyIsActive } from "blaise-api-node-client";
import { removeToStartDateAndDeleteInstrument } from "../../client/componentProcesses";


interface Props {
    instrument: Instrument
    modes: string[]
    setStatus: (status: string) => void
}

function DeleteWarning({ instrument, modes, setStatus }: Props): ReactElement {
    const history = useHistory();
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    async function cancelDelete() {
        history.push("/");
    }

    function ErrorMessage(): ReactElement {
        if (message !== "") {
            return <ONSPanel status="error">
                {message}
            </ONSPanel>;
        }
        return <></>;
    }

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
        history.push("/");
    }

    return (
        <>
            <h1 className="u-mb-l">
                Are you sure you want to delete the questionnaire <em
                className="highlight">{instrument.name}</em>?
            </h1>

            <ONSPanel status={"warn"}>
                The questionnaire and all associated respondent data will be deleted
            </ONSPanel>

            <ErrorMessage />

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
    );
}

export default DeleteWarning;
