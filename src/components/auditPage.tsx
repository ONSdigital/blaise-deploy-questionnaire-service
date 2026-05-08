import { Button, ErrorBoundary, LoadingPanel, Panel } from "blaise-design-system-react-components";
import dateFormatter from "dayjs";
import React, { type ReactElement, useEffect, useState } from "react";

import { getAuditLogs } from "../client/auditLogs";
import { clientLogger } from "../client/logger";
import { type AuditLog } from "../types/auditLog";

import Breadcrumbs from "./breadcrumbs";
import Table, { type TableColumns } from "./onsTable";

function AuditPage(): ReactElement {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [listError, setListError] = useState<string>("");

  useEffect(() => {
    callAuditLogs().then(() => clientLogger.info("callAuditLogs Complete"));
  }, []);

  async function callAuditLogs() {
    let fetchedAuditLogs: AuditLog[] = [];

    setAuditLogs([]);
    setLoading(true);
    setListError("");

    try {
      fetchedAuditLogs = await getAuditLogs();
    } catch (error: unknown) {
      clientLogger.info(`Error getting audit logs: ${error}`);
      clientLogger.info(
        `Response from get audit logs failed, data list length ${fetchedAuditLogs.length}`,
      );
      setListError("Unable to load deployment history.");
      setLoading(false);

      return;
    }

    clientLogger.info(
      `Response from get audit logs successful, data list length ${fetchedAuditLogs.length}`,
    );
    clientLogger.info(fetchedAuditLogs);

    if (fetchedAuditLogs.length === 0) {
      setListError("No recent deployment history found.");
    }

    setAuditLogs(fetchedAuditLogs);
    setLoading(false);
  }

  const tableColumns: TableColumns[] = [{ title: "Date and time" }, { title: "Information" }];

  return (
    <>
      <Breadcrumbs breadcrumbList={[{ link: "/", title: "Home" }]} />

      <main
        id="main-content"
        className="ons-page__main ons-u-mt-no"
      >
        <h1 className="ons-u-mb-l">Questionnaire deployment history</h1>
        <Button
          onClick={() => callAuditLogs()}
          label="Reload"
          primary={true}
          small={true}
        />

        {loading && <LoadingPanel />}
        {!loading && listError !== "" && (
          <Panel
            status={listError.includes("Unable") ? "error" : "info"}
            spacious={true}
          >
            {listError}
          </Panel>
        )}
        {!loading && listError === "" && (
          <div className="elementToFadeIn">
            <ErrorBoundary errorMessageText={"Failed to load deployment history."}>
              <Table
                columns={tableColumns}
                tableID={"audit-table"}
              >
                {auditLogs.map(({ id, timestamp, severity, message }: AuditLog) => (
                  <tr
                    className="ons-table__row"
                    key={id}
                    data-testid={"questionnaire-table-row"}
                  >
                    <td className="ons-table__cell ">
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
