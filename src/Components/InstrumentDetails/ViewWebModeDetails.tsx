import React, {ReactElement, useEffect, useState} from "react";
import {doesInstrumentHaveCAWIMode, generateUACCodes, getCountOfUACs} from "../../utilities/http";
import {Instrument} from "../../../Interfaces";
import {ONSButton, ONSLoadingPanel, ONSPanel} from "blaise-design-system-react-components";
import CsvDownloader from "react-csv-downloader";
import {Datas} from "react-csv-downloader/dist/esm/lib/csv";

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
        }
        setShowGenerateUACsButton(bool);
    }, [instrument, uacCount]);

    const generateUACs = async (): Promise<Datas> => {
        setLoading(true);
        setLoadingMessage("Generating Unique Access Codes for cases");
        setUacGenerationFailed(false);

        return generateUACCodes(instrument.name)
            .then(([success, uacList]) => {
                if (success) {
                    console.log("Generated UAC Codes");
                    getIACsCount();

                    const array: Datas = [];
                    if (uacList === null) {
                        return [];
                    }

                    Object.entries(uacList).forEach(([, value]) => {
                        array.push({
                            case_id: value.case_id,
                            UAC1: value.uac_chunks.uac1,
                            UAC2: value.uac_chunks.uac2,
                            UAC3: value.uac_chunks.uac3
                        });
                    });

                    return array;
                } else {
                    setUacGenerationFailed(true);
                    return [];
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
                                                       filename={`${instrument.name}-uac-codes.csv`}>
                                            <ONSButton label={"Generate and download Unique Access Codes"}
                                                       primary={false} small={true}
                                                       loading={loading}/>
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
