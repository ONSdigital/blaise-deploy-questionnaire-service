import React, {ReactElement} from "react";
import {ONSRadioFieldset} from "../FormElements/ONSRadioFieldset";
import ErrorSummary from "../FormElements/ErrorSummary";

interface SelectFilePageProps {
    instrumentName: string
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
            <h1 className="u-mt-s">
                Are you sure you want to overwrite the entire questionnaire <em
                className="highlight">{instrumentName}</em>?
            </h1>

            <div className="panel panel--warn panel--no-title">
                <span className="panel__icon" aria-hidden="true">!</span>
                <div className="panel__body">
                    All existing questionnaire information will be deleted
                </div>
            </div>

            <ErrorSummary/>

            <ONSRadioFieldset {...field}/>
        </>
    );
}

export default ConfirmOverride;
