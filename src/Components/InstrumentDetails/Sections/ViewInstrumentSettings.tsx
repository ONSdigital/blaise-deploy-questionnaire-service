import React, {ReactElement, useEffect, useState} from "react";
import {getInstrumentModes, getInstrumentSettings} from "../../../utilities/http";
import {Instrument} from "../../../../Interfaces";
import {ONSPanel} from "blaise-design-system-react-components";
import {InstrumentSettings} from "blaise-api-node-client";
import {formatText} from "../../../utilities/TextFormatting/TextFormatting";
import {transform, isEqual, isObject} from "lodash";

interface Props {
    instrument: Instrument;
}

const ViewInstrumentSettings = ({instrument}: Props): ReactElement => {
    // TODO: refactor types in difference() so that I can assign invalidSettings as a global useState
    // TODO: highlight bad settings
    // TODO: tests!
    // TODO: tidy console.log()s

    const [mode, setMode] = useState<string>();
    const [setting, setSetting] = useState<InstrumentSettings>();
    const [errored, setErrored] = useState<boolean>(false);
    // const [invalidSettings, setInvalidSettings] = useState<string[]>();
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
                console.log("data: ", data);
                const setting = data.find(x => x.type === "StrictInterviewing");
                if (setting !== undefined) {
                    setSetting(setting);
                }
            });
    }, []);

    useEffect(() => {
        if (mode === "Mixed") {
            if (setting === null) {
                setErrored(true);
                return;
            }

            const invalidSettings = difference(validMixedModeSettings, setting);
            console.log("validMixedModeSettings: ", validMixedModeSettings);
            console.log("actualMixedModeSettings: ", setting);
            console.log("invalidMixedModeSettings: ", invalidSettings);

        }
        if (mode === "CATI") {
            if (setting === null) {
                setErrored(true);
                return;
            }

            const invalidSettings = difference(validCatiModeSettings, setting);
            console.log("validCatiModeSettings: ", validCatiModeSettings);
            console.log("actualCatiModeSettings: ", setting);
            console.log("invalidCatiModeSettings: ", invalidSettings);
        }

    }, [setting]);

    function difference(object: any, base: any) {
        if (mode === "CATI") {
            ["deleteSessionOnTimeout", "deleteSessionOnQuit", "applyRecordLocking"].forEach(item => delete base[item]);
        }
        return transform(object, (result, value, key) => {
            if (!isEqual(value, base[key])) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                result[key] = isObject(value) && isObject(base[key]) ? difference(value, base[key]) : value;
            }
        });
    }

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
