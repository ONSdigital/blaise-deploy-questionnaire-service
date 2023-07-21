import React, { ReactElement } from "react";
import { useLocation } from "react-router-dom";
import { IQuestionnaire } from "blaise-api-node-client";
import ErroneousWarning from "./erroneousWarning";
import DeleteWarning from "./deleteWarning";
import Breadcrumbs from "../breadcrumbs";

interface Location {
    questionnaire: IQuestionnaire,
    modes : string[],
}

type Props = {
    onDelete: (status: string) => void
    onCancel: () => void
}

function DeleteConfirmation({ onDelete, onCancel }: Props): ReactElement {
    const location = useLocation<Location>();
    const { questionnaire, modes } = location.state || { questionnaire: "", modes: "" };

    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" },
                ]
            } />

            <main id="main-content" className="ons-page__main ons-u-mt-no">
                {
                    (
                        questionnaire.status === "Failed"
                            ? <ErroneousWarning questionnaireName={questionnaire.name} />
                            : <DeleteWarning
                                questionnaire={questionnaire}
                                modes={modes}
                                onDelete={onDelete}
                                onCancel={onCancel}
                            />
                    )
                }
            </main>
        </>
    );
}

export default DeleteConfirmation;
