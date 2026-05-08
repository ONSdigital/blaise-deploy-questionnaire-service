import type { Questionnaire, QuestionnaireSettings } from "blaise-api-node-client";
import React, { type ReactElement, useEffect, useMemo, useState } from "react";

import { clientLogger } from "../../../client/logger";
import { getQuestionnaireSettings } from "../../../client/questionnaires";
import { GetQuestionnaireMode, type QuestionnaireMode } from "../../../utilities/questionnaireMode";
import {
  GetStrictInterviewingSettings,
  ValidateSettings,
} from "../../../utilities/questionnaireSettings";

import QuestionnaireSettingsTable from "./questionnaireSettingsTable";

interface Props {
  questionnaire: Questionnaire;
  modes: string[];
}

function QuestionnaireSettingsSection({ questionnaire, modes }: Props): ReactElement {
  const [setting, setSetting] = useState<QuestionnaireSettings>();
  const [errored, setErrored] = useState<boolean>(false);
  const mode: QuestionnaireMode = useMemo(() => GetQuestionnaireMode(modes), [modes]);

  const invalidSettings: Partial<QuestionnaireSettings> = useMemo(() => {
    if (setting === undefined || mode === undefined) {
      return {};
    }

    const [valid, invalid] = ValidateSettings(setting, mode);

    return valid ? {} : invalid;
  }, [mode, setting]);

  useEffect(() => {
    getQuestionnaireSettings(questionnaire.name)
      .then((questionnaireSettingsList) => {
        if (questionnaireSettingsList.length === 0) {
          clientLogger.error("returned questionnaire settings were null/empty");
          setErrored(true);

          return;
        }

        clientLogger.info("returned questionnaire settings: ", questionnaireSettingsList);
        setSetting(GetStrictInterviewingSettings(questionnaireSettingsList));
      })
      .catch((error: unknown) => {
        clientLogger.error(`Error getting questionnaire settings ${error}`);
        setErrored(true);

        return;
      });
  }, [modes, questionnaire.name]);

  return (
    <QuestionnaireSettingsTable
      questionnaireSettings={setting}
      invalidSettings={invalidSettings}
      errored={errored}
    />
  );
}

export default QuestionnaireSettingsSection;
