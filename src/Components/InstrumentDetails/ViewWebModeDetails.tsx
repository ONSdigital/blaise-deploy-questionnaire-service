import React, {ReactElement, useEffect, useState} from "react";
import {doesInstrumentHaveCAWIMode, generateUACCodes, getCountOfUACs} from "../../utilities/http";
import {Instrument} from "../../../Interfaces";
import {ONSButton, ONSLoadingPanel, ONSPanel} from "blaise-design-system-react-components";

interface Props {
    instrument: Instrument;
}

const ViewWebModeDetails = ({instrument}: Props): ReactElement => {
    const [errored, setErrored] = useState<boolean>(false);
    const [cawiMode, setCawiMode] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingMessage, setLoadingMessage] = useState<string>("Getting web mode information");
    const [uacCount, setUacCount] = useState<number>();
    const [uacGenerationFailed, setUacGenerationFailed] = useState<boolean>(false);
    const [showGenerateUACsButton, setShowGenerateUACsButton] = useState<boolean>(false);

    useEffect(() => {
        doesInstrumentHaveCAWIMode(instrument.name)
            .then((cawiMode) => {
                if (cawiMode === null) {
                    setErrored(true);
                }
                if (cawiMode) {
                    setCawiMode(true);
                }
            }).finally(() => setLoading(false));
        getIACsCount();
    }, []);


    const getIACsCount = () => {
        getCountOfUACs(instrument.name)
            .then((count) => {
                console.log(`count: ${count}`);
                if (count !== null) setUacCount(count);
            });
    };

    useEffect(() => {
        let bool = true;
        if (instrument.dataRecordCount === 0) {
            bool = false;
        } else if (uacCount === instrument.dataRecordCount) {
            bool = false;
        }
        setShowGenerateUACsButton(bool);
    }, [instrument, uacCount]);

    const generateUACs = () => {
        setLoading(true);
        setLoadingMessage("Generating Unique Access Codes for cases");
        setUacGenerationFailed(false);
        generateUACCodes(instrument.name)
            .then((success) => {
                if (success) {
                    console.log("Generated UAC Codes");
                    getIACsCount();
                } else {
                    setUacGenerationFailed(true);
                }
            }).finally(() => setLoading(false));
    };

    if (loading) {
        return (
            <ONSLoadingPanel message={loadingMessage}/>
        );
    }

    if (errored) {
        return (
            <>
                <ONSPanel status={"error"}>
                    <p>Failed to get Web mode details</p>
                </ONSPanel>
            </>

        );
    }

    if (cawiMode) {
        return (
            <div className="summary u-mb-m elementToFadeIn">
                <div className="summary__group">
                    <h2 className="summary__group-title">Web mode details</h2>
                    <table className="summary__items">
                        <thead className="u-vh">
                        <tr>
                            <th>Questionnaire detail</th>
                            <th>result</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody className={`summary__item ${uacGenerationFailed ? "summary__item--error" : ""}`}>
                        {
                            uacGenerationFailed &&
                            <tr className="summary__row">
                                <th colSpan={3} className="summary__row-title u-fs-r">
                                    Unique Access Codes generation failed, try again? I might work ¯\_(ツ)_/¯
                                </th>
                            </tr>
                        }
                        <tr className="summary__row summary__row--has-values">
                            <td className="summary__item-title">
                                <div className="summary__item--text">
                                    Unique Access Codes generated
                                </div>
                            </td>
                            <td className="summary__values">
                                {uacCount}
                            </td>
                            <td className="summary__actions">
                                {
                                    showGenerateUACsButton &&
                                    <>
                                        <ONSButton label={"Generate Unique Access Codes for cases"}
                                                   primary={false}
                                                   small={true}
                                                   onClick={() => generateUACs()}/>
                                    </>

                                }
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="summary u-mb-m elementToFadeIn">
                <div className="summary__group">
                    <h2 className="summary__group-title">Web mode details</h2>
                    <table className="summary__items">
                        <thead className="u-vh">
                        <tr>
                            <th>Questionnaire detail</th>
                            <th>result</th>
                        </tr>
                        </thead>
                        <tbody className="summary__item">
                        <tr className="summary__row summary__row--has-values">
                            <td className="summary__item-title">
                                <div className="summary__item--text">
                                    Does this questionnaire have a Web mode?
                                </div>
                            </td>
                            <td className="summary__values">
                                No
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default ViewWebModeDetails;
