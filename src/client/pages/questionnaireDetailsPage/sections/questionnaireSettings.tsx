import { useQuery } from "@tanstack/react-query";
import { type ReactElement } from "react";

import { getQuestionnaireSettings } from "../../../api/questionnaires";
import { clientLogger } from "../../../utils/logger";
import {
  getStrictInterviewingSettings,
  validateCatiOnlySettings,
  validateQuestionnaireSettings,
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
  const isCatiModeOnly = modes.length === 1 && modes[0] === "CATI";

  const { data: setting, error } = useQuery({
    queryKey: ["questionnaireSettings", questionnaire.name],
    queryFn: async () => {
      const settingsList = await getQuestionnaireSettings(questionnaire.name);

      if (settingsList.length === 0) {
        clientLogger.error("returned questionnaire settings were null/empty");
        throw new Error("returned questionnaire settings were null/empty");
      }

      clientLogger.info("returned questionnaire settings: ", settingsList);

      const strictInterviewingSettings = getStrictInterviewingSettings(settingsList);

      if (!strictInterviewingSettings) {
        // Changed: surface missing StrictInterviewing settings as a real load failure instead of returning a fake object.
        clientLogger.error("returned questionnaire strict interviewing settings were missing");
        throw new Error("returned questionnaire strict interviewing settings were missing");
      }

      return strictInterviewingSettings;
    },
  });

  const errored = !!error;

  const invalidSettings: Partial<QuestionnaireSettingsType> = (() => {
    if (setting === undefined) {
      return {};
    }

    const [valid, invalid] = isCatiModeOnly
      ? validateCatiOnlySettings(setting)
      : validateQuestionnaireSettings(setting);

    return valid ? {} : invalid;
  })();

  return (
    <QuestionnaireSettingsShared
      questionnaireSettings={setting}
      invalidSettings={invalidSettings}
      errored={errored}
    />
  );
}

export { QuestionnaireSettings };
