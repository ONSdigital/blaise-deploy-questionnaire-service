import React, {ReactElement, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import dateFormatter from "dayjs";
import {ErrorBoundary, ONSButton, ONSLoadingPanel, ONSPanel} from "blaise-design-system-react-components";
import {getAuditLogs} from "../utilities/http";
import {AuditLog} from "../../Interfaces";
import ONSTable, {TableColumns} from "./ONSTable";

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
            <p>
                <Link to={"/"}>Previous</Link>
            </p>
            <h1>Questionnaire deployment history</h1>
            <ONSButton onClick={() => callAuditLogs()} label="Reload" primary={true} small={true}/>

            <DisplayAuditPage/>

        </>
    );
}

export default AuditPage;
