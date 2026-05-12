import { type IconProp } from "@fortawesome/fontawesome-svg-core";
import { faGear, faVial } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { LoadingPanel, Panel, Table, TextInput } from "blaise-design-system-react-components";
import dateFormatter from "dayjs";
import React, { type ReactElement, useState } from "react";
import { Link } from "react-router-dom";

import { getQuestionnaires } from "../../api/questionnaires";
import { clientLogger } from "../../utils/logger";
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
  } else if (
    questionnaireName.toUpperCase().includes("CONTACTINFO") ||
    questionnaireName.toUpperCase().includes("ATTEMPTS")
  ) {
    return faGear;
  }

  return faGear;
}

function questionnaireName(questionnaire: Questionnaire) {
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

function questionnaireTableRow(questionnaire: Questionnaire): ReactElement {
  return (
    <tr
      className="ons-table__row"
      key={questionnaire.name}
      data-testid={"questionnaire-table-row"}
    >
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

function questionnaireTable(
  filteredList: Questionnaire[],
  tableColumns: string[],
  message: string,
): ReactElement {
  if (filteredList && filteredList.length > 0) {
    return (
      <Table
        columns={tableColumns}
        id={"questionnaire-table"}
        scrollableLabel={"Questionnaire list"}
      >
        {filteredList.map((item: Questionnaire) => {
          return questionnaireTableRow(item);
        })}
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

const QuestionnairesPage = ({ setErrored }: Props): ReactElement => {
  const [filterText, setFilterText] = useState<string>("");

  const {
    data: questionnaires = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["questionnaires"],
    queryFn: async () => {
      try {
        const data = await getQuestionnaires();

        clientLogger.info(
          `Response from get all questionnaires successful, data list length ${data.length}`,
        );

        return data;
      } catch {
        clientLogger.info("Response from get all questionnaires failed");
        setErrored(true);
        throw new Error("Unable to load questionnaires");
      }
    },
  });

  const handleFilterChange = (value: string) => {
    setFilterText(value);
  };

  const filterQuestionnaireList = (questionnaireList: Questionnaire[], filterValue: string) => {
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
  };

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
            onChange={(e) => handleFilterChange(e.target.value)}
            value={filterText}
          />
        </div>
        <div className="ons-u-mt-s">
          {questionnaires && (
            <h3 aria-live="polite">
              {filteredList.length} results of {questionnaires.length}
            </h3>
          )}
          {questionnaireTable(
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
