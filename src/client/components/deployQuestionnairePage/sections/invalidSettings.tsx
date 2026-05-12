import { Panel } from "blaise-design-system-react-components";
import React, { type ReactElement } from "react";

import { QuestionnaireSettings } from "../../shared/questionnaireSettings";

import type { QuestionnaireSettings as QuestionnaireSettingsType } from "blaise-api-node-client";

interface SelectFilePageProps {
  questionnaireName: string;
  questionnaireSettings: QuestionnaireSettingsType | undefined;
  invalidSettings: Partial<QuestionnaireSettingsType>;
  errored: boolean;
}

function InvalidSettings({
  questionnaireName,
  questionnaireSettings,
  invalidSettings,
  errored,
}: SelectFilePageProps): ReactElement {
  return (
    <>
      <h1 className="ons-u-mb-l">
        Questionnaire settings for <em className="ons-highlight">{questionnaireName}</em> do not
        match recommendations
      </h1>
      <Panel status={"error"}>
        <p>This questionnaire does not match the recommended settings.</p>
        <p>
          If this is expected, select <b>Deploy anyway</b>. If it is not expected, select{" "}
          <b>Cancel</b> and start again.
        </p>
        <p>Please do not leave this page until you have selected an option.</p>
      </Panel>
      <br></br>
      <QuestionnaireSettings
        questionnaireSettings={questionnaireSettings}
        invalidSettings={invalidSettings}
        errored={errored}
      />
    </>
  );
}

export { InvalidSettings };
