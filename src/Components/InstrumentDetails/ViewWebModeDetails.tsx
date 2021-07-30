import React, {ReactElement, useEffect, useState} from "react";
import {doesInstrumentHaveCAWIMode, generateUACCodes} from "../../utilities/http";
import {Instrument} from "../../../Interfaces";
import {ONSButton, ONSLoadingPanel} from "blaise-design-system-react-components";

interface Props {
    instrument: Instrument;
}

const ViewWebModeDetails = ({instrument}: Props): ReactElement => {
    const [cawiMode, setCawiMode] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingMessage, setLoadingMessage] = useState<string>("Getting web mode information");

    useEffect(() => {
        doesInstrumentHaveCAWIMode(instrument.name)
            .then((cawiMode) => {
                if (cawiMode) {
                    setCawiMode(true);
                }
            }).finally(() => setLoading(false));
    }, []);

    const generateUACs = () => {
        setLoading(true);
        setLoadingMessage("Generating Unique Access Codes for cases");
        // DO thing
        generateUACCodes(instrument.name)
            .then((success) => {
                if (success) {
                    console.log("Generated UAC Codes");
                }
                
            }).finally(() => setLoading(false));
    };

    if (loading) {
        return (
            <ONSLoadingPanel message={loadingMessage}/>
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
                        <tbody className="summary__item">
                        <tr className="summary__row summary__row--has-values">
                            <td className="summary__item-title">
                                <div className="summary__item--text">
                                    Unique Access Codes generated
                                </div>
                            </td>
                            <td className="summary__values">
                                Numberwang UAC number
                            </td>
                            <td className="summary__actions">
                                <ONSButton label={"Generate Unique Access Codes for cases"}
                                           primary={true}
                                           small={true}
                                           onClick={() => generateUACs()}/>
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
                                    Does questionnaire have a Web Mode?
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
