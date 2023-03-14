import React, { ReactElement, useEffect, useState } from "react";
import { Link, Redirect, useHistory, useLocation, useParams } from "react-router-dom";
import dateFormatter from "dayjs";
import { Questionnaire } from "blaise-api-node-client";
import Breadcrumbs from "../breadcrumbs";
import QuestionnaireStatus from "../questionnaireStatus";
import BlaiseNodeInfo from "./blaiseNodeInfo";
import CawiModeDetails from "./cawiModeDetails";
import CatiModeDetails from "./catiModeDetails";
import TotalmobileDetails from "./totalmobileDetails";
import YearCalendar from "./yearCalendar";
import ViewQuestionnaireSettings from "./viewQuestionnaireSettings";
import { getQuestionnaire, getQuestionnaireModes, getSurveyDays } from "../../client/questionnaires";
import { ONSButton, ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";

interface State {
    questionnaire: Questionnaire | null;
}

interface Params {
    questionnaireName: string
}

function QuestionnaireDetails(): ReactElement {
    const location = useLocation<State>();
    const history = useHistory();
    const [questionnaire, setQuestionnaire] = useState<Questionnaire>();
    const [modes, setModes] = useState<string[]>([]);
    const [surveyDays, setSurveyDays] = useState<string[]>([]);
    const [errored, setErrored] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);
    const initialState = location.state || { questionnaire: null };
    const { questionnaireName }: Params = useParams();

    useEffect(() => {
        if (initialState.questionnaire === null) {
            loadQuestionnaire().then(() => {
                console.log(`Loaded questionnaire: ${questionnaireName}`);
            }).catch((error: unknown) => {
                console.log(`Failed to get questionnaire ${error}`);
                setErrored(true);
                setLoaded(true);
            });
        } else {
            setQuestionnaire(initialState.questionnaire);
        }
        getQuestionnaireModes(questionnaireName)
            .then((modes) => {
                if (modes.length === 0) {
                    console.error("returned questionnaire mode was empty");
                    setErrored(true);
                    setLoaded(true);
                    return;
                }
                if (modes.includes("CATI")) {
                    getSurveyDays(questionnaireName)
                        .then((surveyDays) => {
                            if (surveyDays.length === 0) {
                                console.log("returned questionnaire survey days was empty");
                                setSurveyDays(surveyDays);
                                setLoaded(true);
                                return;
                            }
                            console.log(`returned questionnaire survey days: ${surveyDays}`);
                            setSurveyDays(surveyDays);
                            setLoaded(true);
                        }).catch((error: unknown) => {
                            console.error(`Error getting questionnaire survey days ${error}`);
                            setErrored(true);
                            setLoaded(true);
                            return;
                        });
                }
                console.log(`returned questionnaire mode: ${modes}`);
                setModes(modes);
                setLoaded(true);
            }).catch((error: unknown) => {
                console.error(`Error getting questionnaire modes ${error}`);
                setErrored(true);
                setLoaded(true);
                return;
            });
    }, []);

    async function loadQuestionnaire(): Promise<void> {
        setLoaded(false);
        const fetchedQuestionnaire = await getQuestionnaire(questionnaireName);
        if (!fetchedQuestionnaire) {
            history.push("/");
        }
        setQuestionnaire(fetchedQuestionnaire);
    }

    function QuestionnaireDetails(): ReactElement {
        if (!loaded) {
            return <ONSLoadingPanel/>;
        }

        console.log(questionnaire);
        if (errored || !questionnaire) {
            return (
                <ONSPanel status="error">
                    Could not get questionnaire details, please try again
                </ONSPanel>
            );
        }

        return (
            <>
                <h1 className="ons-u-mb-l">
                    {questionnaire.name}
                </h1>

                <div className="ons-summary ons-u-mb-m">
                    <div className="ons-summary__group">
                        <h2 className="ons-summary__group-title">Questionnaire details</h2>
                        <table className="ons-summary__items">
                            <thead className="ons-u-vh">
                                <tr>
                                    <th>Detail</th>
                                    <th>Output</th>
                                </tr>
                            </thead>
                            <tbody className="ons-summary__item">
                                <tr className="ons-summary__row ons-summary__row--has-values">
                                    <td className="ons-summary__item-title">
                                        <div className="ons-summary__item--text">
                                        Questionnaire status
                                        </div>
                                    </td>
                                    <td className="ons-summary__values" colSpan={2}>
                                        <QuestionnaireStatus status={questionnaire.status ? questionnaire.status : ""}/>
                                    </td>
                                </tr>
                            </tbody>
                            <tbody className="ons-summary__item">
                                <tr className="ons-summary__row ons-summary__row--has-values">
                                    <td className="ons-summary__item-title">
                                        <div className="ons-summary__item--text">
                                        Modes
                                        </div>
                                    </td>
                                    <td className="ons-summary__values" colSpan={2}>
                                        {modes.join(", ")}
                                    </td>
                                </tr>
                            </tbody>
                            <tbody className="ons-summary__item">
                                <tr className="ons-summary__row ons-summary__row--has-values">
                                    <td className="ons-summary__item-title">
                                        <div className="ons-summary__item--text">
                                        Number of cases
                                        </div>
                                    </td>
                                    <td className="ons-summary__values" colSpan={2}>
                                        {questionnaire.dataRecordCount}
                                    </td>
                                </tr>
                            </tbody>
                            <tbody className="ons-summary__item">
                                <tr className="ons-summary__row ons-summary__row--has-values">
                                    <td className="ons-summary__item-title">
                                        <div className="ons-summary__item--text">
                                        Install date
                                        </div>
                                    </td>
                                    <td className="ons-summary__values" colSpan={2}>
                                        {dateFormatter(questionnaire.installDate).format("DD/MM/YYYY HH:mm")}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <CatiModeDetails questionnaireName={questionnaire.name} modes={modes}/>
                <CawiModeDetails questionnaire={questionnaire} modes={modes}/>
                <TotalmobileDetails questionnaireName={questionnaire.name}/>
                <ViewQuestionnaireSettings questionnaire={questionnaire} modes={modes}/>

                <YearCalendar modes={modes} surveyDays={surveyDays}/>

                <BlaiseNodeInfo questionnaire={questionnaire}/>

                <br></br>

                <ONSButton
                    label={"Delete Questionnaire"}
                    primary={false}
                    aria-label={`Delete questionnaire ${questionnaire.name}`}
                    id="delete-questionnaire"
                    testid="delete-questionnaire"
                    onClick={() => history.push("/delete", { questionnaire, modes })}/>
            </>
        );
    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" },
                ]
            }/>

            <main id="main-content" className="ons-page__main ons-u-mt-no">
                <QuestionnaireDetails/>
            </main>
        </>
    );
}

export default QuestionnaireDetails;
