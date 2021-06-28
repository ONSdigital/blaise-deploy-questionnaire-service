import React, {ReactElement} from "react";
import {ONSRadioFieldset} from "../FormElements/ONSRadioFieldset";
import ErrorSummary from "../FormElements/ErrorSummary";
import dateFormatter from "dayjs";
import {useFormikContext} from "formik";

interface SelectFilePageProps {
    instrumentName: string
}

function AskToSetLiveDate({instrumentName}: SelectFilePageProps): ReactElement {
    const {values}: any = useFormikContext();

    function validateRadio(value: string) {
        let error;

        if (!value) {
            error = "Select an option";
        } else if (values.askToSetLiveDate === "yes" && !values["set live date"]) {
            error = "Enter a live date";
        }
        return error;
    }

    const field = {
        name: "askToSetLiveDate",
        description: "Radio options",
        type: "radio",
        autoFocus: true,
        validate: validateRadio,
        radioOptions: [
            {
                id: "no", label: "No, deploy without live date", value: "no"
            },
            {
                id: "yes", label: "Yes, let me specify a live date", value: "yes",
                specifyOption: {
                    type: "date",
                    id: "set-live-date",
                    name: "set live date",
                    description: "Please specify date",
                    min: dateFormatter(new Date(Date.now())).format("YYYY-MM-DD")
                }
            },
        ]
    };

    return (
        <>
            <h1 className="u-mt-s">
                Would you like to set a live date for questionnaire <em className="highlight">{instrumentName}</em>?
            </h1>

            <ErrorSummary/>

            <ONSRadioFieldset {...field}/>
        </>
    );
}

export default AskToSetLiveDate;
