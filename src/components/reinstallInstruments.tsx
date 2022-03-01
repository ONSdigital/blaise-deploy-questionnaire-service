import React, { Fragment, ReactElement, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { getAllInstrumentsInBucket } from "../client/upload";
import { getInstruments } from "../client/instruments";

import { ErrorBoundary, ONSButton, ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import { verifyAndInstallInstrument } from "../client/componentProcesses";
import Breadcrumbs from "./breadcrumbs";
import { Instrument } from "blaise-api-node-client";

function ReinstallInstruments(): ReactElement {
    const [instrumentList, setInstrumentList] = useState<string[]>([]);
    const [listError, setListError] = useState<string>("Loading ...");
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [instrumentToInstall, setInstrumentToInstall] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [installing, setInstalling] = useState<boolean>(false);
    const history = useHistory();

    useEffect(() => {
        getInstrumentsToReinstall().then();
    }, []);

    async function getInstalledInstrumentList() {
        let instruments: Instrument[];
        try {
            instruments = await getInstruments();
            console.log(`Response from get all instruments successful, data list length ${instrumentList.length}`);
            console.log(instruments);
        } catch (error: unknown) {
            console.log(`Response from get all instruments failed, data list length ${instrumentList.length}`);
            setListError("Unable to load questionnaires");
            setLoading(false);
            return [];
        }

        const list: string[] = [];
        for (const instrument of instruments) {
            list.push(`${instrument.name}.bpkg`);
        }

        return list;
    }

    async function getInstrumentsToReinstall() {
        setLoading(true);
        console.log("getInstrumentsToReinstall");
        const list: string[] = [];
        setListError("");

        let bucketInstrumentList: string[];
        try {
            bucketInstrumentList = await getAllInstrumentsInBucket();
            console.log(`Response from get all instruments in bucket successful, data list length ${bucketInstrumentList.length}`);
        } catch {
            console.log("Response from get all instruments in bucket failed");
            setListError("Unable to load questionnaires.");
            setLoading(false);
            return;
        }

        const installedInstrumentList = await getInstalledInstrumentList();

        bucketInstrumentList.map((instrument: string) => {
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

        const [installed, message] = await verifyAndInstallInstrument(instrumentToInstall);
        if (!installed) {
            setUploadStatus(message);
        }

        history.push("/UploadSummary",
            { questionnaireName: instrumentToInstall.replace(/\.[a-zA-Z]*$/, ""), status: uploadStatus }
        );
    }


    function DisplayInstrumentsToInstallList(): ReactElement {
        return (
            <div className={"elementToFadeIn"}>
                <ErrorBoundary errorMessageText={"Failed to Unable to load questionnaires."}>
                    <form>
                        {
                            listError !== "" ?
                                <ONSPanel spacious={true}>{listError}</ONSPanel>
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
                                                            <br />
                                                        </Fragment>
                                                    );
                                                })
                                            }
                                        </div>
                                    </fieldset>
                                    <br />

                                    <ONSButton
                                        label={"Install selected questionnaire"}
                                        primary={true}
                                        loading={installing}
                                        id="confirm-install"
                                        onClick={() => installInstrumentFromBucket()} />
                                </>
                        }
                    </form>
                </ErrorBoundary>
            </div>
        );
    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" }, { link: "/upload", title: "Deploy a questionnaire" }
                ]
            } />

            <main id="main-content" className="page__main u-mt-no">
                <h1 className="u-mb-l">Reinstall questionnaire</h1>
                <p>
                    Reinstall a previously uploaded questionnaire.
                    <br />
                    This will always deploy the last uploaded version of the questionnaire.
                </p>
                {
                    (loading) ?
                        <ONSLoadingPanel />
                        :
                        DisplayInstrumentsToInstallList()
                }
            </main>
        </>
    );
}

export default ReinstallInstruments;
