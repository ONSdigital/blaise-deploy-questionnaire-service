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
        You have loaded a questionnaire that does not conform to the standard default settings in the BLAX file,
        if this is intended please click the {"\"Deploy anyway\""} button. If it was not your intention please
        correct the settings and reinstall the questionnaire
      </p>
    </>
  );
}

export default ConfirmOverride;
