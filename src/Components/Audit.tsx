import React, {ReactElement, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {ErrorBoundary} from "./ErrorHandling/ErrorBoundary";
import dateFormatter from "dayjs";
import {ONSButton, ONSPanel} from "blaise-design-system-react-components";


interface BlaiseStatus {
    "health check type": string
    status: string
}

function StatusPage(): ReactElement {
    const [auditLogs, setAuditLogs] = useState<BlaiseStatus[]>([]);
    const [listError, setListError] = useState<string>("Loading ...");

    useEffect(() => {
        getAuditLogs();
    }, []);

    function getAuditLogs() {
        setAuditLogs([]);
        setListError("Loading ...");
        console.log("getAuditLogs");
        fetch("/audit_logs")
            .then((r: Response) => {
                if (r.status !== 200) {
                    throw r.status + " - " + r.statusText;
                }
                r.json()
                    .then((json: BlaiseStatus[]) => {
                        if (!Array.isArray(json)) {
                            throw "Json response is not a list";
                        }
                        console.log("Retrieved audit logs, " + json.length + " items/s");
                        setAuditLogs(json);
                        setListError("");
                        if (json.length === 0) setListError("No logs found.");
                    })
                    .catch((error) => {
                        console.error("Unable to read json from response, error: " + error);
                        setListError("Unable to get Audit logs");
                    });
            }).catch((error) => {
                console.error("Failed to retrieve Blaise status, error: " + error);
                setListError("Unable to get Audit logs");
            }
        );
    }


    return (
        <>
            <p>
                <Link to={"/"}>Previous</Link>
            </p>
            <h1>Questionnaire deployment audit logs</h1>
            <ONSButton onClick={() => getAuditLogs()} label="Reload logs" primary={true} small={true}/>
            <ErrorBoundary errorMessageText={"Failed to load audit logs."}>
                {
                    auditLogs && auditLogs.length > 0
                        ?
                        <table id="audit-table" className="table ">
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
                                auditLogs.map((item: any) => {
                                    return (
                                        <tr className="table__row" key={item.insertId}
                                            data-testid={"instrument-table-row"}>
                                            <td className="table__cell ">
                                                {dateFormatter(new Date(item.timestamp.seconds * 1000)).format("DD/MM/YYYY HH:mm:ss")}
                                            </td>
                                            <td className="table__cell ">
                                                <span className={`status status--${item.severity.toLowerCase()}`}>
                                                    {item.jsonPayload.fields.message.stringValue.replace(/^AUDIT_LOG: /, "")}
                                                </span>

                                            </td>
                                        </tr>
                                    );
                                })
                            }
                            </tbody>
                        </table>
                        :
                        <ONSPanel>{listError}</ONSPanel>
                }
            </ErrorBoundary>
        </>
    );
}

export default StatusPage;
