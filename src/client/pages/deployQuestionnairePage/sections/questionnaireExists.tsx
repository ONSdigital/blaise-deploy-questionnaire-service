import { type ReactElement } from "react";

interface SelectFilePageProps {
  questionnaireName: string;
}

function QuestionnaireExists({ questionnaireName }: SelectFilePageProps): ReactElement {
  return (
    <>
      <h1 className="ons-u-mb-l">
        Questionnaire <span className="ons-highlight">{questionnaireName}</span> already exists. Do
        you want to overwrite it?
      </h1>
    </>
  );
}

export { QuestionnaireExists };
