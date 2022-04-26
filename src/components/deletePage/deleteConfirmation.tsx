import React, { ReactElement } from "react";
import { useLocation } from "react-router-dom";
import { Instrument } from "blaise-api-node-client";
import ErroneousWarning from "./erroneousWarning";
import DeleteWarning from "./deleteWarning";
import Breadcrumbs from "../breadcrumbs";


interface Location {
    instrument: Instrument,
    modes : string[],
}

function DeleteConfirmation(): ReactElement {
    const location = useLocation<Location>();
    const { instrument, modes } = location.state || { instrument: "", modes: "" };

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
                        instrument.status === "Failed" 
                            ? <ErroneousWarning instrumentName={instrument.name} />
                            : <DeleteWarning instrument={instrument} modes={modes} />
                    )
                }
            </main>
        </>
    );
}

export default DeleteConfirmation;
