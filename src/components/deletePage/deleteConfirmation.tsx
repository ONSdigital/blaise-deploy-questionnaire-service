import React, { ReactElement } from "react";
import { useLocation } from "react-router-dom";
import { Questionnaire } from "blaise-api-node-client";
import ErroneousWarning from "./erroneousWarning";
import DeleteWarning from "./deleteWarning";
import Breadcrumbs from "../breadcrumbs";

interface Location {
    questionnaire: Questionnaire,
    modes : string[],
}

type Props = {
    setStatus: (status: string) => void
}

function DeleteConfirmation({ setStatus }: Props): ReactElement {
    const location = useLocation<Location>();
    const { questionnaire, modes } = location.state || { questionnaire: "", modes: "" };

    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" },
                ]
            } />

            <main id="main-content" className="page__main u-mt-no">
                {
                    (
                        questionnaire.status === "Failed" 
                            ? <ErroneousWarning questionnaireName={questionnaire.name} />
                            : <DeleteWarning questionnaire={questionnaire} modes={modes} setStatus={setStatus} />
                    )
                }
            </main>
        </>
    );
}

export default DeleteConfirmation;
