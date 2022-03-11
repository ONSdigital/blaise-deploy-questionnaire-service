import React, { ReactElement, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { ONSButton, ONSPanel } from "blaise-design-system-react-components";
import { Instrument } from "blaise-api-node-client";
import ErroneousWarning from "./erroneousWarning";
import DeleteWarning from "./deleteWarning";
import { removeToStartDateAndDeleteInstrument } from "../../client/componentProcesses";
import Breadcrumbs from "../breadcrumbs";


interface Location {
    instrument: Instrument,
    modes : string[]
}

type Props = {
    setStatus: (status: string) => void
}

function DeleteConfirmation({ setStatus }: Props): ReactElement {
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
                            : <DeleteWarning instrument={instrument} modes={modes} setStatus={setStatus}/>                
                    )
                }
            </main>
        </>
    );
}

export default DeleteConfirmation;
