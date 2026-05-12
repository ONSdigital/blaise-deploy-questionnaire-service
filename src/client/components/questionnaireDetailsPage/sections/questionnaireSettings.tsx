import { useQuery } from "@tanstack/react-query";
import React, { type ReactElement, useMemo } from "react";

import { getQuestionnaireSettings } from "../../../api/questionnaires";
import { clientLogger } from "../../../utils/logger";
import { GetQuestionnaireMode, type QuestionnaireMode } from "../../../utils/questionnaireMode";
import {
  GetStrictInterviewingSettings,
  ValidateSettings,
} from "../../../utils/questionnaireSettings";
import { QuestionnaireSettings as QuestionnaireSettingsShared } from "../../shared/questionnaireSettings";

import type {
  Questionnaire,
  QuestionnaireSettings as QuestionnaireSettingsType,
} from "blaise-api-node-client";

interface Props {
  questionnaire: Questionnaire;
  modes: string[];
}

function QuestionnaireSettings({ questionnaire, modes }: Props): ReactElement {
  const mode: QuestionnaireMode = useMemo(() => GetQuestionnaireMode(modes), [modes]);

  const { data: setting, error } = useQuery({
    queryKey: ["questionnaireSettings", questionnaire.name],
    queryFn: async () => {
      const settingsList = await getQuestionnaireSettings(questionnaire.name);

      if (settingsList.length === 0) {
        clientLogger.error("returned questionnaire settings were null/empty");
        throw new Error("returned questionnaire settings were null/empty");
      }

      clientLogger.info("returned questionnaire settings: ", settingsList);

      return GetStrictInterviewingSettings(settingsList);
    },
  });

  const errored = !!error;

  const invalidSettings: Partial<QuestionnaireSettingsType> = useMemo(() => {
    if (setting === undefined || mode === undefined) {
      return {};
    }

    const [valid, invalid] = ValidateSettings(setting, mode);

    return valid ? {} : invalid;
  }, [mode, setting]);

  return (
    <QuestionnaireSettingsShared
      questionnaireSettings={setting}
      invalidSettings={invalidSettings}
      errored={errored}
    />
  );
}

export { QuestionnaireSettings };
