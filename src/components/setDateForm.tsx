import { StyledFormField } from "blaise-design-system-react-components";
import { useFormikContext } from "formik";
import React, { ReactElement } from "react";

interface DateFormProps {
    dateType: string
}

function SetDateForm(DateFormProps: DateFormProps): ReactElement {
    const { values }: any = useFormikContext();
    function validateRadio(value: string) {
        let error;

        if (!value) {
            error = "Select an option";
        } else if (values.askToSetDate === "yes" && !values[`set ${DateFormProps.dateType} date`]) {
            error = `Enter a ${DateFormProps.dateType} date`;
        }
        return error;
    }

    const field = {
        name: "askToSetDate",
        type: "radio",
        autoFocus: true,
        validate: validateRadio,
        radioOptions: [
            {
                id: "no", label: `No ${DateFormProps.dateType} date`, value: "no"
            },
            {
                id: "yes", label: `Yes, let me specify a ${DateFormProps.dateType} date`, value: "yes",
                specifyOption: {
                    type: "date",
                    id: "set-live-date",
                    name: `set ${DateFormProps.dateType} date`,
                    description: "Please specify date"
                }
            },
        ],
        props: {}
    };
    return (
        <StyledFormField {...field}/>
    );
}

export default SetDateForm;
