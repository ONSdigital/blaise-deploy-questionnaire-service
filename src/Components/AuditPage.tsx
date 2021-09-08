import React, {ReactElement, useEffect, useState} from "react";
import dateFormatter from "dayjs";
import {ErrorBoundary, ONSButton, ONSLoadingPanel, ONSPanel} from "blaise-design-system-react-components";
import {getAuditLogs} from "../utilities/http";
import {AuditLog} from "../../Interfaces";
import ONSTable, {TableColumns} from "./ONSTable";
import Breadcrumbs from "./Breadcrumbs";

function AuditPage(): ReactElement {
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [listError, setListError] = useState<string>("");

    useEffect(() => {
        callAuditLogs().then(() => console.log("callAuditLogs Complete"));
    }, []);

    async function callAuditLogs() {
        setAuditLogs([]);
        setLoading(true);
        setListError("");

        const [success, auditLogs] = await getAuditLogs();
        console.log(`Response from get audit logs ${(success ? "successful" : "failed")}, data list length ${auditLogs.length}`);

        if (!success) {
            setListError("Unable to load deployment history.");
            setLoading(false);
            return;
        }

        console.log(auditLogs);

        if (auditLogs.length === 0) {
            setListError("No recent deployment history found.");
        }

        setAuditLogs(auditLogs);
        setLoading(false);
    }

    const tableColumns: TableColumns[] = [
        {title: "Date and time"},
        {title: "Information"}
    ];

    function DisplayAuditPage(): ReactElement {
        if (loading) {
            return <ONSLoadingPanel/>;
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
                            auditLogs.map(({id, timestamp, severity, message}: AuditLog) => {
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
                    {link: "/", title: "Home"},
                ]
            }/>

            <main id="main-content" className="page__main u-mt-no">
                <h1 className="u-mb-l">Questionnaire deployment history</h1>
                <ONSButton onClick={() => callAuditLogs()} label="Reload" primary={true} small={true}/>

                <DisplayAuditPage/>
            </main>

        </>
    );
}

export default AuditPage;
