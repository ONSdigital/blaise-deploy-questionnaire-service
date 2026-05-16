import { Panel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";

interface SelectFilePageProps {
  questionnaireName: string;
}

function ConfirmOverride({ questionnaireName }: SelectFilePageProps): ReactElement {
  return (
    <>
      <h1 className="ons-u-mb-l">
        Are you sure you want to overwrite questionnaire{" "}
        <em className="ons-highlight">{questionnaireName}</em>?
      </h1>

      <Panel status={"warn"}>All questionnaire data will be deleted</Panel>
    </>
  );
}

export { ConfirmOverride };
