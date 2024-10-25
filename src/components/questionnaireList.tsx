import React, { ReactElement, useEffect, useState } from "react";
import { ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import { filter } from "lodash";
import { Questionnaire } from "blaise-api-node-client";
import ONSTable, { TableColumns } from "./onsTable";
import dateFormatter from "dayjs";
import { Link } from "react-router-dom";
import QuestionnaireStatus from "./questionnaireStatus";
import { getQuestionnaires } from "../client/questionnaires";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVial } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type Props = {
    setErrored: (errored: boolean) => void
}

function containsHiddenWord(text: string): boolean {
    const QUESTIONNAIRE_KEYWORDS = ["DST", "CONTACTINFO", "ATTEMPTS"];
    const textUpperCase = text.toUpperCase();
    return QUESTIONNAIRE_KEYWORDS.some(keyword => {
        console.log(`Checking for keyword: ${keyword}, within text: ${textUpperCase}`);
        console.log(`Result: ${textUpperCase.includes(keyword)}`);
        return textUpperCase.includes(keyword);
    });
} 

function questionnaireName(questionnaire: Questionnaire) {
    if (containsHiddenWord(questionnaire.name)) {
        return (
            <>
                <>{questionnaire.name}</> <FontAwesomeIcon icon={faVial as IconProp} />
            </>
        );
    }
    return <>{questionnaire.name}</>;
}

function questionnaireTableRow(questionnaire: Questionnaire): ReactElement {
    return (
        <tr className="ons-table__row" key={questionnaire.name} data-testid={"questionnaire-table-row"}>
            <td className="ons-table__cell ">
                <Link
                    id={`info-${questionnaire.name}`}
                    data-testid={`info-${questionnaire.name}`}
                    aria-label={`View more information for questionnaire ${questionnaire.name}`}
                    to={`/questionnaire/${questionnaire.name}`}
                    state={{ questionnaire: questionnaire }}
                >
                    {questionnaireName(questionnaire)}
                </Link>
            </td>
            <td className="ons-table__cell ">
                {questionnaire.fieldPeriod}
            </td>
            <td className="ons-table__cell ">
                <QuestionnaireStatus status={questionnaire.status ? questionnaire.status : ""} />
            </td>
            <td className="ons-table__cell ">
                {dateFormatter(questionnaire.installDate).format("DD/MM/YYYY HH:mm")}
            </td>
            <td className="ons-table__cell ">
                {questionnaire.dataRecordCount}
            </td>
        </tr >
    );
}

function questionnaireTable(filteredList: Questionnaire[], tableColumns: TableColumns[], message: string): ReactElement {
    if (filteredList && filteredList.length > 0) {
        return <ONSTable columns={tableColumns}
            tableID={"questionnaire-table"}
        >
            {
                filteredList.map((item: Questionnaire) => {
                    return questionnaireTableRow(item);
                })
            }
        </ONSTable>;
    }
    return <ONSPanel spacious={true}
        status={message.includes("Unable") ? "error" : "info"}>{message}</ONSPanel>;
}

export const QuestionnaireList = ({ setErrored }: Props): ReactElement => {
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [realQuestionnaireCount, setRealQuestionnaireCount] = useState<number>(0);
    const [loaded, setLoaded] = useState<boolean>(false);

    const [message, setMessage] = useState<string>("");
    const [filteredList, setFilteredList] = useState<Questionnaire[]>([]);

    function filterListFromState(filterValue: string) {
        if (questionnaires.length === 0) {
            setMessage("No installed questionnaires found.");
            return [];
        }
        // Filter by the search field
        const newFilteredList = filter(questionnaires, (questionnaire) => {
            if (filterValue === "") {
                return questionnaire.name.toUpperCase().includes(filterValue.toUpperCase()) && !containsHiddenWord(questionnaire.name);
            }
            return questionnaire.name.toUpperCase().includes(filterValue.toUpperCase());
        });
        setRealQuestionnaireCount(newFilteredList.length);
        // Order by date
        newFilteredList.sort((a: Questionnaire, b: Questionnaire) => Date.parse(b.installDate) - Date.parse(a.installDate));
        setFilteredList(newFilteredList);

        if (questionnaires.length > 0 && newFilteredList.length === 0) {
            setMessage(`No questionnaires containing ${filterValue} found`);
        }
        return newFilteredList;
    }

    async function getQuestionnairesList() {
        let questionnaires: Questionnaire[];
        try {
            questionnaires = await getQuestionnaires();
            console.log(`Response from get all questionnaires successful, data list length ${questionnaires.length}`);
        } catch (error: unknown) {
            console.log("Response from get all questionnaires failed");
            setMessage("Unable to load questionnaires");
            setErrored(true);
            return [];
        }

        if (questionnaires.length === 0) {
            setMessage("No installed questionnaires found.");
        }

        return questionnaires;
    }

    useEffect(() => {
        getQuestionnairesList().then((questionnaireList: Questionnaire[]) => {
            setQuestionnaires(questionnaireList);
            const filteredQuestionnaireList = filterListFromState("");
            setFilteredList(filteredQuestionnaireList);
            setLoaded(true);
        });
    }, []);

    const tableColumns: TableColumns[] =
        [
            {
                title: "Questionnaire"
            },
            {
                title: "Field period"
            },
            {
                title: "Status"
            },
            {
                title: "Install date"
            },
            {
                title: "Cases"
            }
        ];

    if (!loaded) {
        return <ONSLoadingPanel />;
    }
    return (
        <>
            <div className={"elementToFadeIn ons-u-pt-s"}>
                <div className="ons-field">
                    <label className="ons-label" htmlFor="filter-by-name">Filter by questionnaire name
                    </label>
                    <input type="text" id="filter-by-name" className="ons-input ons-input--text ons-input-type__input"
                        onChange={(e) => filterListFromState(e.target.value)} />
                </div>

                <div className="ons-u-mt-s">
                    {
                        questionnaires &&
                        <h3 aria-live="polite">{filteredList.length} results of {realQuestionnaireCount}</h3>
                    }
                    {
                        questionnaireTable(filteredList, tableColumns, message)
                    }
                </div>
            </div>
        </>
    );
};

export default QuestionnaireList;
