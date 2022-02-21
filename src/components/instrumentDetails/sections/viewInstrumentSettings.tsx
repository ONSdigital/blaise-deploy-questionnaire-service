import React, { ReactElement, useEffect, useState } from "react";
import { getInstrumentModes, getInstrumentSettings } from "../../../utilities/http";
import { InstrumentSettings, Instrument } from "blaise-api-node-client";
import { GetStrictInterviewingSettings, ValidateSettings } from "../../../utilities/instrumentSettings";
import { GetInstrumentMode, InstrumentMode } from "../../../utilities/instrumentMode";
import InstrumentSettingsTable from "../../instrumentSettings/instrumentSettingsTable";

interface Props {
    instrument: Instrument;
}

function ViewInstrumentSettings({ instrument }: Props): ReactElement {
    const [mode, setMode] = useState<InstrumentMode>();
    const [setting, setSetting] = useState<InstrumentSettings>();
    const [errored, setErrored] = useState<boolean>(false);
    const [invalidSettings, setInvalidSettings] = useState<Partial<InstrumentSettings>>({});

    useEffect(() => {
        getInstrumentModes(instrument.name)
            .then((modes) => {
                if (modes === null || modes.length === 0) {
                    console.error("returned instrument mode was null/empty");
                    setErrored(true);
                    return;
                }
                console.log(`returned instrument mode: ${modes}`);
                setMode(GetInstrumentMode(modes));
            });

        getInstrumentSettings(instrument.name)
            .then((instrumentSettingsList) => {
                if (instrumentSettingsList === null || instrumentSettingsList.length === 0) {
                    console.error("returned instrument settings were null/empty");
                    setErrored(true);
                    return;
                }
                console.log("returned instrument settings: ", instrumentSettingsList);
                setSetting(GetStrictInterviewingSettings(instrumentSettingsList));
            });
    }, []);

    useEffect(() => {
        if (setting === undefined || mode == undefined) {
            return;
        }
        const [valid, invalidSettings] = ValidateSettings(setting, mode);
        if (!valid) {
            setInvalidSettings(invalidSettings);
        }

    }, [setting, mode]);

    return <InstrumentSettingsTable instrumentSettings={setting} invalidSettings={invalidSettings} errored={errored} />;
}

export default ViewInstrumentSettings;
