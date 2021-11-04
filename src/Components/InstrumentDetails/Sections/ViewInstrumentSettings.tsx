import React, {ReactElement, useEffect, useState} from "react";
import {getInstrumentModes, getInstrumentSettings} from "../../../utilities/http";
import {Instrument} from "../../../../Interfaces";
import {ONSPanel} from "blaise-design-system-react-components";
import {InstrumentSettings} from "blaise-api-node-client";
import {formatText} from "../../../utilities/TextFormatting/TextFormatting";

interface Props {
    instrument: Instrument;
}

const ViewInstrumentSettings = ({instrument}: Props): ReactElement => {
    const [mode, setMode] = useState<string>();
    const [setting, setSetting] = useState<InstrumentSettings>();
    const [errored, setErrored] = useState<boolean>(false);
    const validMixedModeSettings =
        {
            "type": "StrictInterviewing",
            "saveSessionOnTimeout": true,
            "saveSessionOnQuit": true,
            "deleteSessionOnTimeout": true,
            "deleteSessionOnQuit": true,
            "applyRecordLocking": true
        };
    const validCatiModeSettings = [
        {
            "type": "StrictInterviewing",
            "saveSessionOnTimeout": true,
            "saveSessionOnQuit": true,
            "deleteSessionOnTimeout": "any",
            "deleteSessionOnQuit": "any",
            "applyRecordLocking": false
        }
    ];

    useEffect(() => {
        getInstrumentModes(instrument.name)
            .then((data) => {
                console.log(data);
                if (data === null) {
                    setErrored(true);
                    return;
                }
                if (data.includes("CATI")) {
                    setMode("CATI");
                }
                if (data.length > 1) {
                    setMode("Mixed");
                }
                console.log(mode);
            });

        getInstrumentSettings(instrument.name)
            .then((data) => {
                if (data === null) {
                    setErrored(true);
                    return;
                }
                console.log(data);
                const setting = data.find(x => x.type === "StrictInterviewing");
                if (setting !== undefined) {
                    setSetting(setting);
                }
            });
    }, []);

    // TODO: Help
    useEffect(() => {
        if (mode == "Mixed") {
            if (setting === null) {
                console.log("Setting was null");
                return;
            }

            // TODO: Check 'em
            if (setting !== validMixedModeSettings) {
                console.log("computer says no");
            }

            // TODO: Shallow check 'em and return issues or something...?
            const whateverTheOutputIs = shallowEqual(validMixedModeSettings, setting);


        }
        if (mode === "CATI") {
            // Rules for CATI ONLY questionnaires:
            //
            // saveSessionOnTimeout: true
            // saveSessionOnQuit: true
            // deleteSessionOnTimeout: any
            // deleteSessionOnQuit: any
            // applyRecordLocking: any
        }

    }, [setting]);

    function convertJsonToTable(object: any) {
        const elementList: ReactElement[] = [];
        const entries: [string, (string | null | number)][] = Object.entries(object);
        for (const [field, data] of entries) {
            elementList.push(
                <tbody className="summary__item" key={field}>
                <tr className="summary__row summary__row--has-values">
                    <td className="summary__item-title">
                        <div className="summary__item--text">
                            {formatText(field)}
                        </div>
                    </td>
                    <td className="summary__values" colSpan={2}>
                        {(typeof data === "boolean") ? (data ? "True" : "False") : data}
                    </td>
                </tr>
                </tbody>
            );
        }
        return elementList.map((element => {
            return element;
        }));
    }

    // TODO: Grrr
    function shallowEqual(expectedSetting: object, actualSetting: object) {
        const expectedKeys = Object.keys(expectedSetting);
        const actualKeys = Object.keys(actualSetting);

        if (expectedKeys.length !== actualKeys.length) {
            return false;
        }
        for (let key of expectedKeys) {
            if (expectedSetting[key] !== actualSetting[key]) {
                return false;
            }
        }
    };

    if (errored) {
        return (
            <>
                <ONSPanel status={"error"}>
                    <p>Failed to get questionnaire settings</p>
                </ONSPanel>
            </>

        );
    }

    if (setting) {
        return (
            <div className="summary">
                <div className="summary__group">
                    <h2>Questionnaire settings</h2>
                    <table id="report-table" className="summary__items u-mt-s">
                        {
                            convertJsonToTable(setting)
                        }
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div>
            <p>Loading...</p>
        </div>
    );
};

export default ViewInstrumentSettings;
