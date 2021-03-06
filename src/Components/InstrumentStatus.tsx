import React, {ReactElement} from "react";

interface Props {
    status: string
}

function getStatusColor(status: string | undefined) {
    switch (status) {
        case "Active":
            return "success";
        case "Erroneous":
            return "error";
        case "Failed":
            return "error";
        default:
            return "info";
    }
}

function InstrumentStatus({status}: Props): ReactElement {
    return (
        <>
            <span
                className={`status status--${getStatusColor(status)}`}>
                {status}
            </span>
        </>
    );
}

export default InstrumentStatus;


