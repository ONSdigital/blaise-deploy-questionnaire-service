import React, {ReactElement, useEffect, useState} from "react";
import {useHistory, useLocation, useParams} from "react-router-dom";
import dateFormatter from "dayjs";
import {Instrument} from "blaise-api-node-client";
import Breadcrumbs from "../breadcrumbs";
import InstrumentStatus from "../instrumentStatus";
import BlaiseNodeInfo from "./sections/blaiseNodeInfo";
import ViewWebModeDetails from "./sections/viewWebModeDetails";
import ViewToStartDate from "./sections/viewToStartDate";
import YearCalendar from "./sections/yearCalendar";
import ViewInstrumentSettings from "./sections/viewInstrumentSettings";
import {getInstrument, getInstruments} from "../../client/instruments";
import {ONSLoadingPanel, ONSPanel} from "blaise-design-system-react-components";

interface State {
    instrument: Instrument | null;
}

interface Params {
    instrumentName: string
}

function InstrumentDetails(): ReactElement {
    const location = useLocation<State>();
    const history = useHistory();
    const [instrument, setInstrument] = useState<Instrument>();
    const [errored, setErrored] = useState<boolean>(false);
    const [loaded, setLoaded]  = useState<boolean>(false);
    const initialState = location.state || {instrument: null};
    const {instrumentName}: Params = useParams();

    useEffect(() => {
        if (initialState.instrument === null) {
            loadInstrument().then(() => {
                console.log(`Loaded instrument: ${instrumentName}`);
                setLoaded(true);
            }).catch((error: unknown) => {
                console.log(`Failed to get instrument ${error}`);
                setErrored(true);
                setLoaded(true);
            });
        } else {
            setInstrument(initialState.instrument);
            setLoaded(true);
        }
    }, []);

    async function loadInstrument(): Promise<void> {
        setLoaded(false);
        const fetchedInstrument = await getInstrument(instrumentName);
        if (!fetchedInstrument) {
            history.push("/");
        }
        setInstrument(fetchedInstrument);
    }

    function InstrumentDetails(): ReactElement {
        if (!loaded) {
            return <ONSLoadingPanel />;
        }

        console.log(instrument);
        if (errored || !instrument) {
            return (
                <ONSPanel status="error">
                    Could not get questionnaire details, please try again
                </ONSPanel>
            );
        }

        return (
            <>
                <h1 className="u-mb-l">
                    {instrument.name}
                </h1>

                <ViewToStartDate instrumentName={instrument.name}/>

                <div className="summary u-mb-m">
                    <div className="summary__group">
                        <h2 className="summary__group-title">Questionnaire details</h2>
                        <table className="summary__items">
                            <thead className="u-vh">
                            <tr>
                                <th>Detail</th>
                                <th>Output</th>
                            </tr>
                            </thead>
                            <tbody className="summary__item">
                            <tr className="summary__row summary__row--has-values">
                                <td className="summary__item-title">
                                    <div className="summary__item--text">
                                        Questionnaire status
                                    </div>
                                </td>
                                <td className="summary__values" colSpan={2}>
                                    <InstrumentStatus status={instrument.status ? instrument.status : ""}/>
                                </td>
                            </tr>
                            </tbody>
                            <tbody className="summary__item">
                            <tr className="summary__row summary__row--has-values">
                                <td className="summary__item-title">
                                    <div className="summary__item--text">
                                        Number of cases
                                    </div>
                                </td>
                                <td className="summary__values" colSpan={2}>
                                    {instrument.dataRecordCount}
                                </td>
                            </tr>
                            </tbody>
                            <tbody className="summary__item">
                            <tr className="summary__row summary__row--has-values">
                                <td className="summary__item-title">
                                    <div className="summary__item--text">
                                        Install date
                                    </div>
                                </td>
                                <td className="summary__values" colSpan={2}>
                                    {dateFormatter(instrument.installDate).format("DD/MM/YYYY HH:mm")}
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <ViewInstrumentSettings instrument={instrument}/>
                <ViewWebModeDetails instrument={instrument}/>

                <h2 className={"u-mt-m"}>Survey days</h2>
                <YearCalendar surveyDays={instrument.surveyDays}/>

                <BlaiseNodeInfo instrument={instrument}/>
            </>
        );
    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    {link: "/", title: "Home"},
                ]
            }/>

            <main id="main-content" className="page__main u-mt-no">
                <InstrumentDetails />
            </main>
        </>
    );
}

export default InstrumentDetails;
