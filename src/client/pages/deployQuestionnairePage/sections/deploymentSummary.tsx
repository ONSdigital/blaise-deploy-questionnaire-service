import { GroupedSummary, SummaryGroupTable } from "blaise-design-system-react-components";
import dateFormatter from "dayjs";
import { type FormikContextType, useFormikContext } from "formik";
import { type ReactElement } from "react";

import {
  shouldAskTmReleaseDate,
  shouldAskToStartDate,
} from "../../../utils/deploymentDateQuestionRules";
import { roundUp } from "../../../utils/maths";

import type { Questionnaire } from "blaise-api-node-client";

interface PageFourProps {
  file: File | undefined;
  foundQuestionnaire: Questionnaire | null;
}

type DeployFormValues = {
  toStartDate?: string;
  tmReleaseDate?: string;
};

function DeploymentSummary({ file, foundQuestionnaire }: PageFourProps): ReactElement {
  const { values: formValues }: FormikContextType<DeployFormValues> = useFormikContext();
  const questionnaireName = file?.name.replace(/\.[a-zA-Z]*$/, "") ?? "";

  const records: Record<string, string | undefined> = {
    "Questionnaire file name": file?.name,
    "Questionnaire file last modified date": dateFormatter(file?.lastModified).format(
      "DD/MM/YYYY HH:mm",
    ),
    "Questionnaire file size": file ? `${roundUp(file.size / 1000000, 0)}MB` : undefined,
    "Already exists": foundQuestionnaire ? "Yes, overwriting questionnaire" : "No",
  };

  if (shouldAskToStartDate(questionnaireName)) {
    records["Telephone Operations start date"] = formValues.toStartDate
      ? dateFormatter(formValues.toStartDate).format("DD/MM/YYYY")
      : "Not specified";
  }

  if (shouldAskTmReleaseDate(questionnaireName)) {
    records["Totalmobile release date"] = formValues.tmReleaseDate
      ? dateFormatter(formValues.tmReleaseDate).format("DD/MM/YYYY")
      : "Not specified";
  }

  const groupedSummary = new GroupedSummary([{ title: "Deployment summary", records }]);

  return <SummaryGroupTable groupedSummary={groupedSummary} />;
}

export { DeploymentSummary };
