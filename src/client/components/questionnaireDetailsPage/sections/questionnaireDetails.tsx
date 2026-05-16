import { GroupedSummary, SummaryGroupTable } from "blaise-design-system-react-components";
import dateFormatter from "dayjs";
import { type ReactElement } from "react";

import type { Questionnaire } from "blaise-api-node-client";

interface Props {
  questionnaire: Questionnaire;
  modes: string[];
}

function QuestionnaireDetails({ questionnaire, modes }: Props): ReactElement {
  const groupedSummary = new GroupedSummary([
    {
      title: "Questionnaire details",
      records: {
        Status: questionnaire.status ? questionnaire.status : "",
        Modes: modes.join(", "),
        "Number of cases": questionnaire.dataRecordCount,
        "Install date": dateFormatter(questionnaire.installDate).format("DD/MM/YYYY HH:mm"),
        "Blaise version": questionnaire.blaiseVersion,
      },
    },
  ]);

  return (
    <>
      <div className="ons-u-mb-m">
        <SummaryGroupTable groupedSummary={groupedSummary} />
      </div>
    </>
  );
}

export { QuestionnaireDetails };
