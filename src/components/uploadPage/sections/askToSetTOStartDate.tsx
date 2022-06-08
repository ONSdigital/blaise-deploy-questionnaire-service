import React, {ReactElement} from "react";
import {useFormikContext} from "formik";
import {StyledFormErrorSummary, StyledFormField} from "blaise-design-system-react-components";

interface SelectFilePageProps {
    questionnaireName: string;
}

function AskToSetTOStartDate({questionnaireName}: SelectFilePageProps): ReactElement {
    const {values}: any = useFormikContext();

    function validateRadio(value: string) {
        let error;

        if (!value) {
            error = "Select an option";
        } else if (values.askToSetTOStartDate === "yes" && !values["set TO start date"]) {
            error = "Enter a start date";
        }
        return error;
    }

    const field = {
        name: "askToSetTOStartDate",
        type: "radio",
        autoFocus: true,
        validate: validateRadio,
        radioOptions: [
            {
                id: "no", label: "No start date", value: "no"
            },
            {
                id: "yes", label: "Yes, let me specify a start date", value: "yes",
                specifyOption: {
                    type: "date",
                    id: "set-live-date",
                    name: "set TO start date",
                    description: "Please specify date"
                }
            },
        ],
        props: {}
    };

    return (
        <>
            <div className="grid">
                <div className="grid__col col-8@m">
                    <h1 className="u-mb-l">
                        Would you like to set a telephone operations start date for questionnaire <em
                        className="highlight">{questionnaireName}</em>?
                    </h1>

                    <p>
                        This is used by the TOBI service to determine after what date a questionnaire
                        should be visible for telephone operators to start interviewing. If it not set, TOBI
                        will use the surveys days to determine when to display.
                    </p>


                    <StyledFormErrorSummary/>

                    <StyledFormField {...field}/>
                </div>
            </div>
        </>
    );
}

export default AskToSetTOStartDate;
