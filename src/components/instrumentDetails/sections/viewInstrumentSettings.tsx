import React, {ReactElement, useEffect, useState} from "react";
import {getInstrumentSettings} from "../../../client/instruments";
import {InstrumentSettings, Instrument} from "blaise-api-node-client";
import {GetStrictInterviewingSettings, ValidateSettings} from "../../../utilities/instrumentSettings";
import {GetInstrumentMode, InstrumentMode} from "../../../utilities/instrumentMode";
import InstrumentSettingsTable from "../../instrumentSettings/instrumentSettingsTable";

interface Props {
    instrument: Instrument;
    modes: string[];
}

function ViewInstrumentSettings({instrument, modes}: Props): ReactElement {
    const [mode, setMode] = useState<InstrumentMode>();
    const [setting, setSetting] = useState<InstrumentSettings>();
    const [errored, setErrored] = useState<boolean>(false);
    const [invalidSettings, setInvalidSettings] = useState<Partial<InstrumentSettings>>({});

    useEffect(() => {
        setMode(GetInstrumentMode(modes));

        getInstrumentSettings(instrument.name)
            .then((instrumentSettingsList) => {
                if (instrumentSettingsList.length === 0) {
                    console.error("returned instrument settings were null/empty");
                    setErrored(true);
                    return;
                }
                console.log("returned instrument settings: ", instrumentSettingsList);
                setSetting(GetStrictInterviewingSettings(instrumentSettingsList));
            }).catch((error: unknown) => {
            console.error(`Error getting instrument settings ${error}`);
            setErrored(true);
            return;
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

    return <InstrumentSettingsTable instrumentSettings={setting} invalidSettings={invalidSettings} errored={errored}/>;
}

export default ViewInstrumentSettings;
