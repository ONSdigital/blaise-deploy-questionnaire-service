import React, {ReactElement} from "react";
import {StyledFormErrorSummary, StyledFormField} from "blaise-design-system-react-components";

interface SelectFilePageProps {
    instrumentName: string
}

function AlreadyExists({instrumentName}: SelectFilePageProps): ReactElement {

    function validateRadio(value: string) {
        let error;
        if (!value) {
            error = "Select an option";
        }
        return error;
    }

    const field = {
        name: "override",
        description: "",
        type: "radio",
        autoFocus: true,
        validate: validateRadio,
        radioOptions: [
            {id: "cancel", label: "Cancel and keep original questionnaire", value: "cancel"},
            {id: "continue", label: "Overwrite the entire questionnaire", value: "continue"},
        ]
    };

    return (
        <>
            <h1 className="u-mt-s">
                Questionnaire file <em className="highlight">{instrumentName}</em> already exists in the system.
                <br/>
                What action do you want to take?
            </h1>

            <StyledFormErrorSummary/>

            <StyledFormField {...field}/>
        </>
    );
}

export default AlreadyExists;
