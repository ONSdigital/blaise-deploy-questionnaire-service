import React, {Fragment, ReactElement, useEffect, useState} from "react";
import {Link, Redirect} from "react-router-dom";
import {ErrorBoundary} from "./ErrorHandling/ErrorBoundary";
import {getAllInstrumentsInBucket, verifyAndInstallInstrument} from "../utilities/http";
import {ONSButton, ONSPanel} from "blaise-design-system-react-components";
import {Instrument} from "../../Interfaces";

interface Props {
    installedInstruments: Instrument[]
}

function ReinstallInstruments({installedInstruments}: Props): ReactElement {
    const [instrumentList, setInstrumentList] = useState<string[]>([]);
    const [listError, setListError] = useState<string>("Loading ...");
    const [redirect, setRedirect] = useState<boolean>(false);
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [instrumentName, setInstrumentName] = useState<string>("");
    const [instrumentToInstall, setInstrumentToInstall] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        getInstruments().then();
    }, [installedInstruments]);

    function getInstalledInstrumentList() {
        const list : string[] = [];
        installedInstruments.map(({name}) => {
            list.push(`${name}.bpkg`);
        });
        return list;
    }

    async function getInstruments() {
        console.log("getInstruments");
        const list : string[] = [];
        setListError("");

        const [success, bucketInstrumentList] = await getAllInstrumentsInBucket();

        if (!success) {
            setListError("Unable to load questionnaires");
            return;
        }

        const installedInstrumentList = getInstalledInstrumentList();

        bucketInstrumentList.map((instrument) => {
            if (!installedInstrumentList.includes(instrument)) {
                list.push(instrument);
            }
        });

        if (list.length === 0) {
            setListError("No compatible previously installed questionnaires found.");
        }

        setInstrumentList(list);
    }

    async function installInstrumentFromBucket() {
        setLoading(true);
        setInstrumentName(instrumentToInstall.replace(/\.[a-zA-Z]*$/, ""));

        // Validate the file is in the bucket and call the rest API to install
        const [installed, message] = await verifyAndInstallInstrument(instrumentToInstall);
        if (!installed) {
            setUploadStatus(message);
        }
        console.log(installed);
        setRedirect(true);
    }


    return (
        <>
            {
                redirect && <Redirect
                    to={{
                        pathname: "/UploadSummary",
                        state: {questionnaireName: instrumentName, status: uploadStatus}
                    }}/>
            }
            <p>
                <Link to={"/"}>Previous</Link>
            </p>
            <h1>Reinstall questionnaire</h1>
            <ErrorBoundary errorMessageText={"Failed to Unable to load questionnaires."}>
                <form>
                    {
                        listError !== "" ?
                            <ONSPanel>{listError}</ONSPanel>
                            :
                            <>
                                <fieldset className="fieldset">
                                    <legend className="fieldset__legend">
                                        Select a questionnaire to install
                                    </legend>
                                    <div className="radios__items">
                                        {
                                            instrumentList.map((item: string) => {
                                                return (
                                                    <Fragment key={item}>
                                                        <p className="radios__item">
                                                            <span className="radio">
                                                                <input
                                                                    type="radio"
                                                                    id={`install-${item}`}
                                                                    className="radio__input js-radio "
                                                                    value={item}
                                                                    name="select-survey"
                                                                    aria-label="No"
                                                                    onChange={() => setInstrumentToInstall(item)}
                                                                />
                                                                <label className="radio__label "
                                                                       htmlFor={`install-${item}`}>
                                                                    {item}
                                                                </label>
                                                            </span>
                                                        </p>
                                                        <br/>
                                                    </Fragment>
                                                );
                                            })
                                        }
                                    </div>
                                </fieldset>
                                <br/>

                                <ONSButton
                                    label={"Install questionnaire"}
                                    primary={true}
                                    loading={loading}
                                    id="confirm-install"
                                    onClick={() => installInstrumentFromBucket()}/>
                            </>
                    }
                </form>
            </ErrorBoundary>
        </>
    );
}

export default ReinstallInstruments;
