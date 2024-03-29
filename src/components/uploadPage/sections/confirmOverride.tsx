import React, { ReactElement } from "react";
import { ONSPanel, StyledFormErrorSummary, StyledFormField } from "blaise-design-system-react-components";

interface SelectFilePageProps {
    questionnaireName: string;
}

function ConfirmOverride({ questionnaireName }: SelectFilePageProps): ReactElement {
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
            { id: "yes", label: "Yes, overwrite questionnaire", value: "yes" },
            { id: "cancel", label: "No, do not overwrite questionnaire", value: "cancel" },
        ],
        props: {}
    };

    return (
        <>
            <h1 className="ons-u-mb-l">
                Are you sure you want to overwrite the entire questionnaire <em
                    className="ons-highlight">{questionnaireName}</em>?
            </h1>

            <ONSPanel status={"warn"}>
                All existing questionnaire information will be deleted
            </ONSPanel>

            <StyledFormErrorSummary />

            <StyledFormField {...field} />
        </>
    );
}

export default ConfirmOverride;
