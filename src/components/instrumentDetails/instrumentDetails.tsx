import React, {ReactElement, useEffect, useState} from "react";
import {Link, Redirect, useHistory, useLocation, useParams} from "react-router-dom";
import dateFormatter from "dayjs";
import {Instrument} from "blaise-api-node-client";
import Breadcrumbs from "../breadcrumbs";
import InstrumentStatus from "../instrumentStatus";
import BlaiseNodeInfo from "./sections/blaiseNodeInfo";
import ViewCawiModeDetails from "./sections/viewCawiModeDetails";
import ViewCatiModeDetails from "./sections/viewCatiModeDetails";
import YearCalendar from "./sections/yearCalendar";
import ViewInstrumentSettings from "./sections/viewInstrumentSettings";
import { getInstrument, getInstrumentModes, getSurveyDays } from "../../client/instruments";
import { ONSButton, ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";

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
    const [modes, setModes] = useState<string[]>([]);
    const [surveyDays, setSurveyDays] = useState<string[]>([]);
    const [errored, setErrored] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);
    const initialState = location.state || {instrument: null};
    const {instrumentName}: Params = useParams();

    useEffect(() => {
        if (initialState.instrument === null) {
            loadInstrument().then(() => {
                console.log(`Loaded instrument: ${instrumentName}`);
            }).catch((error: unknown) => {
                console.log(`Failed to get instrument ${error}`);
                setErrored(true);
                setLoaded(true);
            });
        } else {
            setInstrument(initialState.instrument);
        }
        getInstrumentModes(instrumentName)
            .then((modes) => {
                if (modes.length === 0) {
                    console.error("returned instrument mode was empty");
                    setErrored(true);
                    setLoaded(true);
                    return;
                }
                if (modes.includes("CATI")) {
                    getSurveyDays(instrumentName)
                        .then((surveyDays) => {
                            if (surveyDays.length === 0) {
                                console.log("returned instrument survey days was empty");
                                setSurveyDays(surveyDays);
                                setLoaded(true);
                                return;
                            }
                            console.log(`returned instrument survey days: ${surveyDays}`);
                            setSurveyDays(surveyDays);
                            setLoaded(true);
                        }).catch((error: unknown) => {
                        console.error(`Error getting instrument survey days ${error}`);
                        setErrored(true);
                        setLoaded(true);
                        return;
                    });
                }
                console.log(`returned instrument mode: ${modes}`);
                setModes(modes);
                setLoaded(true);
            }).catch((error: unknown) => {
            console.error(`Error getting instrument modes ${error}`);
            setErrored(true);
            setLoaded(true);
            return;
        });
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
            return <ONSLoadingPanel/>;
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
                                        Modes
                                    </div>
                                </td>
                                <td className="summary__values" colSpan={2}>
                                    {modes.join(", ")}
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

                <ViewCatiModeDetails instrumentName={instrument.name} modes={modes}/>
                <ViewCawiModeDetails instrument={instrument} modes={modes}/>
                <ViewInstrumentSettings instrument={instrument} modes={modes}/>

                <YearCalendar modes={modes} surveyDays={surveyDays}/>

                <BlaiseNodeInfo instrument={instrument}/>

                <br></br>

                <ONSButton
                            label={"Delete Questionnaire"}
                            primary={false}
                            aria-label={`Delete questionnaire ${instrument.name}`}
                            id="delete-questionnaire"
                            testid="delete-questionnaire"
                            onClick={() => history.push("/delete", {instrument, modes})}/>
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
                <InstrumentDetails/>
            </main>
        </>
    );
}

export default InstrumentDetails;
