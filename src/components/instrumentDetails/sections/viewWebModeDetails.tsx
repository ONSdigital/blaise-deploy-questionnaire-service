import React, { ReactElement, useEffect, useState } from "react";
import { getCountOfUACs } from "../../../client/uacCodes";
import { getInstrumentModes } from "../../../client/instruments";
import { Instrument } from "blaise-api-node-client";
import { ONSButton, ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import CsvDownloader from "react-csv-downloader";
import { generateUACCodesAndCSVFileData } from "../../../client/componentProcesses";

interface Props {
    instrument: Instrument;
}


const ViewWebModeDetails = ({ instrument }: Props): ReactElement => {
    const [errored, setErrored] = useState<boolean>(false);
    const [cawiMode, setCawiMode] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingMessage, setLoadingMessage] = useState<string>("Getting web mode information");
    const [uacCount, setUacCount] = useState<number>();
    const [uacGenerationFailed, setUacGenerationFailed] = useState<boolean>(false);
    const [showGenerateUACsButton, setShowGenerateUACsButton] = useState<boolean>(false);

    function getUACCount() {
        getCountOfUACs(instrument.name)
            .then((count) => {
                console.log(`count: ${count}`);
                if (count !== null) setUacCount(count);
            }).catch(() => {
                setErrored(true);
            });
    }

    async function generateUACs() {
        setLoading(true);
        setLoadingMessage("Generating Unique Access Codes for cases");
        setUacGenerationFailed(false);

        return generateUACCodesAndCSVFileData(instrument.name)
            .then((uacList) => {
                console.log("Generated UAC Codes");
                getUACCount();
                return uacList;
            }).catch((error) => {
                setUacGenerationFailed(true);
                console.error(error);
                console.error("Error occurred while generating Unique Access Codes");
                return [{ error: "Error occurred while generating Unique Access Codes" }];
            }).finally(() => setLoading(false));
    }

    useEffect(() => {
        getInstrumentModes(instrument.name)
            .then((modes: string[]) => {
                if (modes.includes("CAWI")) {
                    setCawiMode(true);
                }
            }).catch(() => {
                setErrored(true);
                return;
            }).finally(() => setLoading(false));
        getUACCount();
    }, []);


    useEffect(() => {
        let bool = true;
        if (instrument.dataRecordCount === 0) {
            bool = false;
        }
        setShowGenerateUACsButton(bool);
    }, [instrument, uacCount]);

    if (loading) {
        return (
            <ONSLoadingPanel message={loadingMessage} />
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
            <div className="summary u-mb-m elementToFadeIn u-mt-m">
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
                                        {/* Why are we inflicting this on the users? */}
                                        I receive an appropriate error describing suitable user actions
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
                                            <CsvDownloader datas={generateUACs}
                                                bom={false}
                                                filename={`${instrument.name}-uac-codes.csv`}>
                                                <ONSButton label={"Generate and download Unique Access Codes"}
                                                    primary={false} small={true}
                                                    loading={loading} />
                                            </CsvDownloader>
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
            <div className="summary u-mb-m elementToFadeIn u-mt-m">
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
