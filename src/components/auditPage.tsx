import React, { ReactElement, useEffect, useState } from "react";
import dateFormatter from "dayjs";
import { ErrorBoundary, ONSButton, ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import { getAuditLogs } from "../client/auditLogs";
import { AuditLog } from "../server/auditLogging/logger";
import ONSTable, { TableColumns } from "./onsTable";
import Breadcrumbs from "./breadcrumbs";

function AuditPage(): ReactElement {
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [listError, setListError] = useState<string>("");

    useEffect(() => {
        callAuditLogs().then(() => console.log("callAuditLogs Complete"));
    }, []);

    async function callAuditLogs() {
        let fetchedAuditLogs: AuditLog[] = [];
        setAuditLogs([]);
        setLoading(true);
        setListError("");

        try {
            fetchedAuditLogs = await getAuditLogs();
        } catch (error: unknown) {
            console.log(`Error getting audit logs: ${error}`);
            console.log(`Response from get audit logs failed, data list length ${fetchedAuditLogs.length}`);
            setListError("Unable to load deployment history.");
            setLoading(false);
            return;
        }
        console.log(`Response from get audit logs successful, data list length ${fetchedAuditLogs.length}`);
        console.log(fetchedAuditLogs);

        if (fetchedAuditLogs.length === 0) {
            setListError("No recent deployment history found.");
        }

        setAuditLogs(fetchedAuditLogs);
        setLoading(false);
    }

    const tableColumns: TableColumns[] = [
        { title: "Date and time" },
        { title: "Information" }
    ];

    function DisplayAuditPage(): ReactElement {
        if (loading) {
            return <ONSLoadingPanel />;
        } else if (listError !== "") {
            return (
                <ONSPanel status={listError.includes("Unable") ? "error" : "info"}
                    spacious={true}>
                    {listError}
                </ONSPanel>
            );
        }

        return (
            <div className={"elementToFadeIn"}>
                <ErrorBoundary errorMessageText={"Failed to load deployment history."}>
                    <ONSTable columns={tableColumns} tableID={"audit-table"}>
                        {
                            auditLogs.map(({ id, timestamp, severity, message }: AuditLog) => {
                                return (
                                    <tr className="table__row" key={id}
                                        data-testid={"instrument-table-row"}>
                                        <td className="table__cell ">
                                            {dateFormatter(new Date(timestamp)).format("DD/MM/YYYY HH:mm:ss")}
                                        </td>
                                        <td className="table__cell ">
                                            <span className={`status status--${severity.toLowerCase()}`}>
                                                {message}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        }
                    </ONSTable>
                </ErrorBoundary>
            </div>
        );
    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" },
                ]
            } />

            <main id="main-content" className="page__main u-mt-no">
                <h1 className="u-mb-l">Questionnaire deployment history</h1>
                <ONSButton onClick={() => callAuditLogs()} label="Reload" primary={true} small={true} />

                <DisplayAuditPage />
            </main>

        </>
    );
}

export default AuditPage;
