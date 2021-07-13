import React, {ReactElement, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {ErrorBoundary} from "./ErrorHandling/ErrorBoundary";
import dateFormatter from "dayjs";
import {ONSButton, ONSLoadingPanel, ONSPanel} from "blaise-design-system-react-components";
import {getAuditLogs} from "../utilities/http";
import {AuditLog} from "../../Interfaces";

function AuditPage(): ReactElement {
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [listError, setListError] = useState<string>("Loading ...");

    useEffect(() => {
        callAuditLogs().then(() => console.log("callAuditLogs Complete"));
    }, []);

    async function callAuditLogs() {
        setAuditLogs([]);
        setLoading(true);

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


    return (
        <>
            <p>
                <Link to={"/"}>Previous</Link>
            </p>
            <h1>Questionnaire deployment history</h1>
            <ONSButton onClick={() => callAuditLogs()} label="Reload" primary={true} small={true}/>
            <ErrorBoundary errorMessageText={"Failed to load deployment history."}>
                {
                    auditLogs && auditLogs.length > 0
                        ?
                        <table id="audit-table" className="table elementToFadeIn">
                            <thead className="table__head u-mt-m">
                            <tr className="table__row">
                                <th scope="col" className="table__header ">
                                    <span>Date and time</span>
                                </th>
                                <th scope="col" className="table__header ">
                                    <span>Information</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody className="table__body">
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
                            </tbody>
                        </table>
                        :
                        loading ?
                            <ONSLoadingPanel/>
                            :
                            <ONSPanel status={(listError.includes("Unable") ? "error" : "info")}>{listError}</ONSPanel>
                }
            </ErrorBoundary>
        </>
    );
}

export default AuditPage;
