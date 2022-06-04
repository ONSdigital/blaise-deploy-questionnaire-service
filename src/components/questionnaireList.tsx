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

type Props = {
    setErrored: (errored: boolean) => void
}

function questionnaireTableRow(questionnaire: Questionnaire): ReactElement {
    function questionnaireName(questionnaire: Questionnaire) {
        if (questionnaire.name.toUpperCase().startsWith("DST")) {
            return (
                <>
                    <>{questionnaire.name}</> <FontAwesomeIcon icon={faVial} />
                </>
            );
        }
        return <>{questionnaire.name}</>;
    }

    return (
        <tr className="table__row" key={questionnaire.name} data-testid={"questionnaire-table-row"}>
            <td className="table__cell ">
                <Link
                    id={`info-${questionnaire.name}`}
                    data-testid={`info-${questionnaire.name}`}
                    aria-label={`View more information for questionnaire ${questionnaire.name}`}
                    to={{
                        pathname: `/questionnaire/${questionnaire.name}`,
                        state: { questionnaire: questionnaire }
                    }}>
                    {questionnaireName(questionnaire)}
                </Link>
            </td>
            <td className="table__cell ">
                {questionnaire.fieldPeriod}
            </td>
            <td className="table__cell ">
                <QuestionnaireStatus status={questionnaire.status ? questionnaire.status : ""} />
            </td>
            <td className="table__cell ">
                {dateFormatter(questionnaire.installDate).format("DD/MM/YYYY HH:mm")}
            </td>
            <td className="table__cell ">
                {questionnaire.dataRecordCount}
            </td>
        </tr>
    );
}

export const QuestionnaireList = ({ setErrored }: Props): ReactElement => {
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [realQuestionnaireCount, setRealQuestionnaireCount] = useState<number>(0);
    const [loaded, setLoaded] = useState<boolean>(false);

    const [message, setMessage] = useState<string>("");
    const [filteredList, setFilteredList] = useState<Questionnaire[]>([]);

    function filterTestQuestionnaires(questionnairesToFilter: Questionnaire[], filterValue: string): Questionnaire[] {
        if (!filterValue.toUpperCase().startsWith("DST")) {
            questionnairesToFilter = filter(questionnairesToFilter, (questionnaire) => {
                if (!questionnaire?.name) {
                    return false;
                }
                return !questionnaire.name.toUpperCase().startsWith("DST");
            });
            setRealQuestionnaireCount(questionnairesToFilter.length);
        }
        return questionnairesToFilter;
    }

    function filterList(filterValue: string) {
        // Filter by the search field
        if (filterValue === "") {
            setFilteredList(filterTestQuestionnaires(questionnaires, filterValue));
        }
        const newFilteredList = filter(filterTestQuestionnaires(questionnaires, filterValue), (questionnaire) => questionnaire.name.includes(filterValue.toUpperCase()));
        // Order by date
        newFilteredList.sort((a: Questionnaire, b: Questionnaire) => Date.parse(b.installDate) - Date.parse(a.installDate));
        setFilteredList(newFilteredList);

        if (questionnaires.length > 0 && newFilteredList.length === 0) {
            setMessage(`No questionnaires containing ${filterValue} found`);
        }
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
            const nonTestQuestionnaires = filterTestQuestionnaires(questionnaireList, "");
            setFilteredList(nonTestQuestionnaires);
            if (nonTestQuestionnaires.length === 0) {
                setMessage("No installed questionnaires found.");
            }
            setLoaded(true);
        });
    }, []);

    function QuestionnaireTable(): ReactElement {
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
            <div className={"elementToFadeIn u-pt-s"}>
                <div className="field">
                    <label className="label" htmlFor="filter-by-name">Filter by questionnaire name
                    </label>
                    <input type="text" id="filter-by-name" className="input input--text input-type__input"
                        onChange={(e) => filterList(e.target.value)} />
                </div>

                <div className="u-mt-s">
                    {
                        questionnaires &&
                        <h3 aria-live="polite">{filteredList.length} results of {realQuestionnaireCount}</h3>
                    }

                    <QuestionnaireTable />
                </div>
            </div>
        </>
    );
};

export default QuestionnaireList;
