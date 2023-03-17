import React, { ReactElement } from "react";
import { StyledFormErrorSummary } from "blaise-design-system-react-components";
import SetDateForm from "../../setDateForm";

interface SelectFilePageProps {
    questionnaireName: string;
}

function AskToSetTMReleaseDate({ questionnaireName }: SelectFilePageProps): ReactElement {
    return (
        <>
            <div className="ons-grid">
                <div className="ons-grid__col ons-col-8@m">
                    <h1 className="ons-u-mb-l">
                        Would you like to set a Totalmobile release date for questionnaire <em
                            className="ons-highlight">{questionnaireName}</em>?
                    </h1>

                    <p>
                        This is used to determine the date that selected cases will be sent to Totalmobile for field allocation. If a date is not selected, then no cases will be sent to Totalmobile.
                    </p>

                    <StyledFormErrorSummary/>

                    <SetDateForm dateType="release"/>
                </div>
            </div>
        </>
    );
}

export default AskToSetTMReleaseDate;
