import React, { type ReactElement } from "react";

interface SelectFilePageProps {
  questionnaireName: string;
}

function QuestionnaireExists({ questionnaireName }: SelectFilePageProps): ReactElement {
  return (
    <>
      <h1 className="ons-u-mb-l">
        Questionnaire <em className="ons-highlight">{questionnaireName}</em> already exists.
        <br />
        Do you want to overwrite it?
      </h1>
    </>
  );
}

export { QuestionnaireExists };
