import React, { ReactElement } from "react";
import QuestionnaireSettingsTable from "../../questionnaireDetailsPage/sections/questionnaireSettingsTable";
import { IQuestionnaireSettings } from "blaise-api-node-client";
import { ONSPanel } from "blaise-design-system-react-components";

interface SelectFilePageProps {
    questionnaireName: string;
    questionnaireSettings: IQuestionnaireSettings | undefined
    invalidSettings: Partial<IQuestionnaireSettings>
    errored: boolean
}

function ConfirmOverride({
    questionnaireName,
    questionnaireSettings,
    invalidSettings,
    errored
}: SelectFilePageProps): ReactElement {

    return (
        <>
            <h1 className="ons-u-mb-l">
                Questionnaire settings for {questionnaireName} do not match recommendations
            </h1>
            <ONSPanel status={"error"}>
                <p>
                    This questionnaire does not conform to the standard settings.
                </p>
                <p>
                    If this is intended, please click the {"\"Deploy anyway\""} button. If it was not intended, please select the {"\"Cancel\""} button, and
                    start again.
                </p>
                <p>
                    Do not navigate away from this page without selecting an option.
                </p>
            </ONSPanel>
            <br></br>
            <QuestionnaireSettingsTable questionnaireSettings={questionnaireSettings} invalidSettings={invalidSettings}
                errored={errored} />
        </>
    );
}

export default ConfirmOverride;
