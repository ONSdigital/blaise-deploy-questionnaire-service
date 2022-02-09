import React, { ReactElement } from "react";
import InstrumentSettingsTable from "../../InstrumentSettings/InstrumentSettingsTable";
import { InstrumentSettings } from "blaise-api-node-client";

interface SelectFilePageProps {
  instrumentName: string;
  instrumentSettings: InstrumentSettings | undefined
  invalidSettings: Partial<InstrumentSettings>
  errored: boolean
}

function ConfirmOverride({ instrumentName, instrumentSettings, invalidSettings, errored }: SelectFilePageProps): ReactElement {

  return (
    <>
      <h1 className="u-mb-l">
        Questionnaire settings for {instrumentName} do not match recommendations
      </h1>

      <InstrumentSettingsTable instrumentSettings={instrumentSettings} invalidSettings={invalidSettings} errored={errored} />

      <p>
        This questionnaire does not conform to the standard settings.

        If this is intended, please click the &quotDeploy anyway&quot button. If it was not intended, please select the &quotCancel&quot button, and start again.

        Do not navigate away from this page without selecting an option.
      </p>
    </>
  );
}

export default ConfirmOverride;
