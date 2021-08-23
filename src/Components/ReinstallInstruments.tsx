import React, {Fragment, ReactElement, useEffect, useState} from "react";
import {Link, Redirect} from "react-router-dom";
import {getAllInstrumentsInBucket} from "../utilities/http";
import {ErrorBoundary, ONSButton, ONSLoadingPanel, ONSPanel} from "blaise-design-system-react-components";
import {Instrument} from "../../Interfaces";
import {verifyAndInstallInstrument} from "../utilities/processes";

interface Props {
    installedInstruments: Instrument[];
    listLoading: boolean;
}

function ReinstallInstruments({installedInstruments, listLoading}: Props): ReactElement {
    const [instrumentList, setInstrumentList] = useState<string[]>([]);
    const [listError, setListError] = useState<string>("Loading ...");
    const [redirect, setRedirect] = useState<boolean>(false);
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [instrumentName, setInstrumentName] = useState<string>("");
    const [instrumentToInstall, setInstrumentToInstall] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [installing, setInstalling] = useState<boolean>(false);

    useEffect(() => {
        getInstruments().then();
    }, [installedInstruments]);

    function getInstalledInstrumentList() {
        const list: string[] = [];
        installedInstruments.map(({name}) => {
            list.push(`${name}.bpkg`);
        });
        return list;
    }

    async function getInstruments() {
        setLoading(true);
        console.log("getInstruments");
        const list: string[] = [];
        setListError("");

        const [success, bucketInstrumentList] = await getAllInstrumentsInBucket();

        if (!success) {
            setListError("Unable to load questionnaires.");
            setLoading(false);
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
        setLoading(false);
    }

    async function installInstrumentFromBucket() {
        setInstalling(true);
        setInstrumentName(instrumentToInstall.replace(/\.[a-zA-Z]*$/, ""));

        const [installed, message] = await verifyAndInstallInstrument(instrumentToInstall);
        if (!installed) {
            setUploadStatus(message);
        }

        setRedirect(true);
    }


    function DisplayInstrumentsToInstallList(): ReactElement {
        return (
            <div className={"elementToFadeIn"}>
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
                                        label={"Install selected questionnaire"}
                                        primary={true}
                                        loading={installing}
                                        id="confirm-install"
                                        onClick={() => installInstrumentFromBucket()}/>
                                </>
                        }
                    </form>
                </ErrorBoundary>
            </div>
        );
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
            {
                (listLoading || loading) ?
                    <ONSLoadingPanel/>
                    :
                    DisplayInstrumentsToInstallList()
            }
        </>
    );
}

export default ReinstallInstruments;
