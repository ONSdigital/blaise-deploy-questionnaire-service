import { useQuery } from "@tanstack/react-query";
import {
  Button,
  ErrorBoundary,
  LoadingPanel,
  Panel,
  Table,
} from "blaise-design-system-react-components";
import dateFormatter from "dayjs";
import React, { type ReactElement } from "react";

import { getAuditLogs } from "../../api/auditLogs";
import { type AuditLog } from "../../utils/auditLog.types";

function AuditPage(): ReactElement {
  const {
    data: auditLogs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: async () => {
      return await getAuditLogs();
    },
  });

  let listError = "";

  if (error) {
    listError = "Unable to load deployment history.";
  } else if (auditLogs.length === 0 && !isLoading) {
    listError = "No recent deployment history found.";
  }

  const tableColumns: string[] = ["Date and time", "Information"];

  return (
    <>
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        <h1 className="ons-u-mb-l">Questionnaire deployment history</h1>
        <Button
          onClick={() => refetch()}
          label="Reload"
          primary={true}
          small={true}
        />

        {isLoading && <LoadingPanel />}
        {!isLoading && listError !== "" && (
          <Panel
            status={listError.includes("Unable") ? "error" : "info"}
            spacious={true}
          >
            {listError}
          </Panel>
        )}
        {!isLoading && listError === "" && (
          <div>
            <ErrorBoundary errorMessageText={"Failed to load deployment history"}>
              <Table
                columns={tableColumns}
                id={"audit-table"}
                scrollableLabel={"Deployment history"}
              >
                {auditLogs.map(({ id, timestamp, severity, message }: AuditLog) => (
                  <tr
                    className="ons-table__row"
                    key={id}
                    data-testid={"questionnaire-table-row"}
                  >
                    <td className="ons-table__cell " style={{ whiteSpace: "nowrap" }}>
                      {dateFormatter(new Date(timestamp)).format("DD/MM/YYYY HH:mm:ss")}
                    </td>
                    <td className="ons-table__cell ">
                      <span className={`ons-status ons-status--${severity.toLowerCase()}`}>
                        {message}
                      </span>
                    </td>
                  </tr>
                ))}
              </Table>
            </ErrorBoundary>
          </div>
        )}
      </main>
    </>
  );
}

export default AuditPage;
