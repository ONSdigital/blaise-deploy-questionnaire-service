import React, {ReactElement, useEffect, useState} from "react";
import {getInstrumentModes, getInstrumentSettings} from "../../../utilities/http";
import {Instrument} from "../../../../Interfaces";
import {ONSPanel, ONSLoadingPanel} from "blaise-design-system-react-components";
import {InstrumentSettings} from "blaise-api-node-client";
import {formatText} from "../../../utilities/TextFormatting/TextFormatting";
import {transform, isEqual, isObject} from "lodash";

interface Props {
    instrument: Instrument;
}

function ViewInstrumentSettings({instrument}: Props): ReactElement {
    const [mode, setMode] = useState<string>();
    const [setting, setSetting] = useState<InstrumentSettings>();
    const [errored, setErrored] = useState<boolean>(false);
    const [invalidSettings, setInvalidSettings] = useState<InstrumentSettings>();
    const validMixedModeSettings = {
        "type": "StrictInterviewing",
        "saveSessionOnTimeout": true,
        "saveSessionOnQuit": true,
        "deleteSessionOnTimeout": true,
        "deleteSessionOnQuit": true,
        "applyRecordLocking": true,
    };

    const validCatiModeSettings = {
        "type": "StrictInterviewing",
        "saveSessionOnTimeout": true,
        "saveSessionOnQuit": true,
    };

    useEffect(() => {
        getInstrumentModes(instrument.name)
            .then((data) => {
                if (data === null || data.length === 0) {
                    console.error("returned instrument mode was null/empty");
                    setErrored(true);
                    return;
                }
                console.log(`returned instrument mode: ${data}`);
                if (data === ["CATI"]) {
                    console.log("setting mode to 'CATI'");
                    setMode("CATI");
                }
                else if (data.length > 1) {
                    console.log("setting mode to 'Mixed'");
                    setMode("Mixed");
                }
            });

        getInstrumentSettings(instrument.name)
            .then((data) => {
                if (data === null || data.length === 0) {
                    console.error("returned instrument settings were null/empty");
                    setErrored(true);
                    return;
                }
                console.log("returned instrument settings: ", data);
                const setting = data.find(x => x.type === "StrictInterviewing");
                if (setting !== undefined) {
                    setSetting(setting);
                }
            });
    }, []);

    useEffect(() => {
        if (mode === "Mixed") {
            setInvalidSettings(difference(validMixedModeSettings, setting));
            console.log("expected settings: ", validMixedModeSettings);
            console.log("actual settings: ", setting);
            console.log("diff: ", invalidSettings);

        }
        if (mode === "CATI") {
            setInvalidSettings(difference(validCatiModeSettings, setting));
            console.log("expected settings: ", validCatiModeSettings);
            console.log("actual settings: ", setting);
            console.log("diff: ", invalidSettings);
        }

    }, [setting]);

    function difference(object: any, base: any): any {
        if (mode === "CATI") {
            const irrelevantSettings = ["deleteSessionOnTimeout", "deleteSessionOnQuit", "applyRecordLocking"];
            console.log(`removing ${irrelevantSettings} from comparison`);
            irrelevantSettings.forEach(item => delete base[item]);
        }
        return transform(object, (result, value, key) => {
            if (!isEqual(value, base[key])) {
                result[key] = isObject(value) && isObject(base[key]) ? difference(value, base[key]) : value;
            }
        });
    }

    function convertJsonToTable(object: any) {
        const elementList: ReactElement[] = [];
        const entries: [string, (string | null | number | boolean)][] = Object.entries(object);

        for (const [field, data] of entries) {
            let invalid = false;
            let fieldCorrectValue;
            if (invalidSettings !== undefined) {
                invalid = Object.prototype.hasOwnProperty.call(invalidSettings, field);
                fieldCorrectValue = Object.getOwnPropertyDescriptor(invalidSettings, field)?.value;
            }

            elementList.push(
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
        }
        return elementList.map((element => {
            return element;
        }));
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
                        {
                            convertJsonToTable(setting)
                        }
                    </table>
                </div>
            </div>
        );
    }

    return (
        <ONSLoadingPanel message={"Getting questionnaire settings"}/>
    );
}

export default ViewInstrumentSettings;
