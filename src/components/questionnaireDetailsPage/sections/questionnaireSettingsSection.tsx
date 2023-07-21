import React, { ReactElement, useEffect, useState } from "react";
import { getQuestionnaireSettings } from "../../../client/questionnaires";
import { IQuestionnaireSettings, IQuestionnaire } from "blaise-api-node-client";
import { GetStrictInterviewingSettings, ValidateSettings } from "../../../utilities/questionnaireSettings";
import { GetQuestionnaireMode, QuestionnaireMode } from "../../../utilities/questionnaireMode";
import QuestionnaireSettingsTable from "./questionnaireSettingsTable";

interface Props {
    questionnaire: IQuestionnaire;
    modes: string[];
}

function QuestionnaireSettingsSection({ questionnaire, modes }: Props): ReactElement {
    const [mode, setMode] = useState<QuestionnaireMode>();
    const [setting, setSetting] = useState<IQuestionnaireSettings>();
    const [errored, setErrored] = useState<boolean>(false);
    const [invalidSettings, setInvalidSettings] = useState<Partial<IQuestionnaireSettings>>({});

    useEffect(() => {
        setMode(GetQuestionnaireMode(modes));

        getQuestionnaireSettings(questionnaire.name)
            .then((questionnaireSettingsList) => {
                if (questionnaireSettingsList.length === 0) {
                    console.error("returned questionnaire settings were null/empty");
                    setErrored(true);
                    return;
                }
                console.log("returned questionnaire settings: ", questionnaireSettingsList);
                setSetting(GetStrictInterviewingSettings(questionnaireSettingsList));
            }).catch((error: unknown) => {
                console.error(`Error getting questionnaire settings ${error}`);
                setErrored(true);
                return;
            });
    }, []);

    useEffect(() => {
        if (setting === undefined || mode == undefined) {
            return;
        }
        const [valid, invalidSettings] = ValidateSettings(setting, mode);
        if (!valid) {
            setInvalidSettings(invalidSettings);
        }

    }, [setting, mode]);

    return <QuestionnaireSettingsTable questionnaireSettings={setting} invalidSettings={invalidSettings} errored={errored}/>;
}

export default QuestionnaireSettingsSection;
