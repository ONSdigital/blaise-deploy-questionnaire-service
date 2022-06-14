import React, {ReactElement} from "react";
import {useFormikContext} from "formik";
import {StyledFormErrorSummary, StyledFormField} from "blaise-design-system-react-components";
import SetDateForm from "../../SetDateForm";

interface SelectFilePageProps {
    questionnaireName: string;
}

function AskToSetTOStartDate({questionnaireName}: SelectFilePageProps): ReactElement {
    // const {values}: any = useFormikContext();
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


                    <SetDateForm dateType="start"/>
                </div>
            </div>
        </>
    );
}

export default AskToSetTOStartDate;
