import { ONSButton, ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import React, { ReactElement, useEffect, useState } from "react";
import { Questionnaire } from "blaise-api-node-client";
import { removeToStartDateAndDeleteQuestionnaire } from "../../client/componentProcesses";
import { surveyIsActive } from "../../client/questionnaires";

interface Props {
    questionnaire: Questionnaire
    modes: string[]
    onDelete: (message: string) => void
    onCancel: () => void
}

function DeleteWarning({ questionnaire, modes, onDelete, onCancel }: Props): ReactElement {
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [active, setActive] = useState<boolean>(false);
    const [errored, setErrored] = useState<boolean>(false);

    useEffect(() => {
        if (modes.includes("CATI")) {
            surveyIsActive(questionnaire.name).then((isActive: boolean) => {
                console.log(`Survey has active survey days: ${isActive}`);
                setActive(isActive);
                setLoaded(true);
            }).catch((error: unknown) => {
                console.error(`Failed to get survey is active: ${error}`);
                setErrored(true);
                setLoaded(true);
            });
        } else {
            setLoaded(true);
        }
    }, []);

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

        const [deleted, message] = await removeToStartDateAndDeleteQuestionnaire(questionnaire.name);
        if (!deleted) {
            setMessage(message);
            setLoading(false);
            return;
        }

        setLoading(false);
        onDelete(`Questionnaire: ${questionnaire.name} Successfully deleted`);
    }

    function CatiWarning(): ReactElement {
        if (modes.includes("CATI") && questionnaire.status?.toLowerCase() === "active" && active) {
            return (
                <ONSPanel status={"error"}>
                    Questionnaire has active Telephone Operations survey days
                </ONSPanel>
            );
        }
        return <></>;
    }

    function CawiWarning(): ReactElement {
        if (modes.includes("CAWI") && questionnaire.status?.toLowerCase() === "active") {
            return (
                <ONSPanel status={"error"}>
                    Questionnaire is active for web collection
                </ONSPanel>
            );
        }
        return <></>;
    }

    function DeleteWarning(): ReactElement {
        if (!loaded) {
            return <ONSLoadingPanel/>;
        }

        if (errored) {
            return (
                <ONSPanel status="error">
                    Could not get warning details, please try again
                </ONSPanel>
            );
        }

        return (
            <>
                <h1 className="u-mb-l">
                    Are you sure you want to delete the questionnaire <em
                        className="highlight">{questionnaire.name}</em>?
                </h1>

                <CatiWarning />
                <CawiWarning />

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
                        onClick={() => onCancel()} />
                    }
                </form>
            </>
        );
    }

    return (
        <>
            <DeleteWarning/>
        </>
    );
}

export default DeleteWarning;
