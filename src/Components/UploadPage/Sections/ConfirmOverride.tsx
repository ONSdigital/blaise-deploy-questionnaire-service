import React, {ReactElement} from "react";
import {ONSPanel, StyledFormErrorSummary, StyledFormField} from "blaise-design-system-react-components";

interface SelectFilePageProps {
    instrumentName: string;
}

function ConfirmOverride({instrumentName}: SelectFilePageProps): ReactElement {

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
            {id: "yes", label: "Yes, overwrite questionnaire", value: "yes"},
            {id: "cancel", label: "No, do not overwrite questionnaire", value: "cancel"},
        ]
    };

    return (
        <>
            <h1 className="u-mb-l">
                Are you sure you want to overwrite the entire questionnaire <em
                className="highlight">{instrumentName}</em>?
            </h1>

            <ONSPanel status={"warn"}>
                All existing questionnaire information will be deleted
            </ONSPanel>

            <StyledFormErrorSummary/>

            <StyledFormField {...field}/>
        </>
    );
}

export default ConfirmOverride;
