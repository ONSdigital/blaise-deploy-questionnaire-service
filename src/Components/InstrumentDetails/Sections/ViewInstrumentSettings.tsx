import React, { ReactElement, useEffect, useState } from "react";
import { getInstrumentModes, getInstrumentSettings } from "../../../utilities/http";
import { Instrument } from "../../../../Interfaces";
import { ONSPanel, ONSLoadingPanel } from "blaise-design-system-react-components";
import { InstrumentSettings } from "blaise-api-node-client";
import { formatText } from "../../../utilities/TextFormatting/TextFormatting";
import { GetStrictInterviewingSettings, ValidateSettings } from "../../../utilities/instrument_settings";
import { transform, isEqual, isObject } from "lodash";

interface Props {
    instrument: Instrument;
}

function ViewInstrumentSettings({ instrument }: Props): ReactElement {
    const [mode, setMode] = useState<string>();
    const [setting, setSetting] = useState<InstrumentSettings>();
    const [errored, setErrored] = useState<boolean>(false);
    const [invalidSettings, setInvalidSettings] = useState<Partial<InstrumentSettings>>();

    useEffect(() => {
        getInstrumentModes(instrument.name)
            .then((data) => {
                if (data === null || data.length === 0) {
                    console.error("returned instrument mode was null/empty");
                    setErrored(true);
                    return;
                }
                console.log(`returned instrument mode: ${data}`);
                if (data.length === 1 && data[0] === "CATI") {
                    console.log("setting mode to 'CATI'");
                    setMode("CATI");
                } else if (data.length > 1) {
                    console.log("setting mode to 'Mixed'");
                    setMode("Mixed");
                }
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
    interface ConvertJsonToTableProps {
        instrumentSettings: InstrumentSettings
    }
    function ConvertJsonToTable({ instrumentSettings }: ConvertJsonToTableProps): ReactElement {
        const [settingsObjects, setSettingsObjects] = useState<ReactElement[]>([]);

        useEffect(() => {
            const newElements: ReactElement[] = [];
            for (const [field, data] of Object.entries(instrumentSettings)) {
                let invalid = false;
                let fieldCorrectValue;
                if (invalidSettings !== undefined) {
                    if (field in invalidSettings) {
                        invalid = true;
                        fieldCorrectValue = invalidSettings[field as keyof InstrumentSettings];
                    }
                }

                newElements.push(
                    <tbody className={`summary__item ${invalid ? "summary__item--error" : ""}`} key={field}>
                        {
                            invalid &&
                            <tr className="summary__row">
                                <th colSpan={3} className="summary__row-title u-fs-r">
                                    {formatText(field)} should
                                    be {(typeof fieldCorrectValue === "boolean") ? (fieldCorrectValue ? "True" : "False") : fieldCorrectValue}
                                </th>
                            </tr>
                        }
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
                setSettingsObjects(newElements);

            }
        }, [instrumentSettings, invalidSettings]);

        return (
            <>
                {
                    settingsObjects.map((element => {
                        return element;
                    }))
                }
            </>
        );
    }

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
                        <ConvertJsonToTable instrumentSettings={setting} />
                    </table>
                </div>
            </div>
        );
    }

    return (
        <ONSLoadingPanel message={"Getting questionnaire settings"} />
    );
}

export default ViewInstrumentSettings;
