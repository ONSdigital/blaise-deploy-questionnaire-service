import { type IconProp } from "@fortawesome/fontawesome-svg-core";
import { faGear, faVial } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { LoadingPanel, Panel, Table, TextInput } from "blaise-design-system-react-components";
import dateFormatter from "dayjs";
import { type ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getQuestionnaires } from "../../api/questionnaires";
import { QuestionnaireStatus } from "../shared/questionnaireStatus";

import type { Questionnaire } from "blaise-api-node-client";

type Props = {
  setErrored: (errored: boolean) => void;
};

function isHiddenQuestionnaire(questionnaireName: string): boolean {
  const QUESTIONNAIRE_KEYWORDS = ["DST", "CONTACTINFO", "ATTEMPTS"];

  return QUESTIONNAIRE_KEYWORDS.some((keyword) => {
    return questionnaireName.toUpperCase().includes(keyword);
  });
}

function getQuestionnaireIcon(questionnaireName: string): IconProp {
  if (questionnaireName.toUpperCase().includes("DST")) {
    return faVial;
  }

  return faGear;
}

function QuestionnaireNameCell(questionnaire: Questionnaire) {
  if (isHiddenQuestionnaire(questionnaire.name)) {
    return (
      <>
        <>{questionnaire.name} </>
        <FontAwesomeIcon icon={getQuestionnaireIcon(questionnaire.name) as IconProp} />
      </>
    );
  }

  return <>{questionnaire.name}</>;
}

function QuestionnaireTableRow({ questionnaire }: { questionnaire: Questionnaire }): ReactElement {
  return (
    <tr
      className="ons-table__row"
      data-testid={"questionnaire-table-row"}
    >
      <td className="ons-table__cell ">
        <Link
          id={`info-${questionnaire.name}`}
          data-testid={`info-${questionnaire.name}`}
          aria-label={`View information for questionnaire ${questionnaire.name}`}
          to={`/questionnaire/${questionnaire.name}`}
          state={{ questionnaire: questionnaire }}
        >
          {QuestionnaireNameCell(questionnaire)}
        </Link>
      </td>
      <td className="ons-table__cell ">{questionnaire.fieldPeriod}</td>
      <td className="ons-table__cell ">
        <QuestionnaireStatus status={questionnaire.status ? questionnaire.status : ""} />
      </td>
      <td className="ons-table__cell ">
        {dateFormatter(questionnaire.installDate).format("DD/MM/YYYY HH:mm")}
      </td>
      <td className="ons-table__cell ">{questionnaire.dataRecordCount}</td>
    </tr>
  );
}

function QuestionnaireTable(
  filteredList: Questionnaire[],
  tableColumns: string[],
  message: string,
): ReactElement {
  if (filteredList.length > 0) {
    return (
      <Table
        columns={tableColumns}
        id={"questionnaire-table"}
        scrollableLabel={"Questionnaire list"}
      >
        {filteredList.map((item: Questionnaire) => (
          <QuestionnaireTableRow
            key={item.name}
            questionnaire={item}
          />
        ))}
      </Table>
    );
  }

  return (
    <Panel
      spacious={true}
      status={message.includes("Unable") ? "error" : "info"}
    >
      {message}
    </Panel>
  );
}

function filterQuestionnaireList(questionnaireList: Questionnaire[], filterValue: string) {
  if (questionnaireList.length === 0) {
    return [];
  }

  const newFilteredList = questionnaireList.filter((questionnaire) => {
    if (filterValue === "") {
      return !isHiddenQuestionnaire(questionnaire.name);
    }

    return questionnaire.name.toUpperCase().includes(filterValue.toUpperCase());
  });

  newFilteredList.sort(
    (a: Questionnaire, b: Questionnaire) => Date.parse(b.installDate) - Date.parse(a.installDate),
  );

  return newFilteredList;
}

const QuestionnairesPage = ({ setErrored }: Props): ReactElement => {
  const [filterText, setFilterText] = useState<string>("");

  const {
    data: questionnaires = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["questionnaires"],
    queryFn: getQuestionnaires,
  });

  useEffect(() => {
    setErrored(!!error);
  }, [error, setErrored]);

  const filteredList = filterQuestionnaireList(questionnaires, filterText);

  let message = "";

  if (error) {
    message = "Unable to load questionnaires";
  } else if (questionnaires.length === 0 && !isLoading) {
    message = "No installed questionnaires found.";
  } else if (questionnaires.length > 0 && filteredList.length === 0) {
    message = `No questionnaires containing ${filterText} found`;
  }

  if (isLoading) {
    return <LoadingPanel />;
  }

  return (
    <>
      <div className={"ons-u-pt-s"}>
        <div className="ons-field">
          <TextInput
            id="filter-by-name"
            label="Filter by questionnaire name"
            onChange={(e) => setFilterText(e.target.value)}
            value={filterText}
          />
        </div>
        <div className="ons-u-mt-s">
          <h3 aria-live="polite">
            {filteredList.length} results of {questionnaires.length}
          </h3>
          {QuestionnaireTable(
            filteredList,
            ["Questionnaire", "Field period", "Status", "Install date", "Cases"],
            message,
          )}
        </div>
      </div>
    </>
  );
};

export default QuestionnairesPage;
