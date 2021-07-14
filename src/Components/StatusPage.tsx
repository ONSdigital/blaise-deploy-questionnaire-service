import {ONSLoadingPanel, ONSPanel} from "blaise-design-system-react-components";
import React, {Fragment, ReactElement, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {ErrorBoundary} from "./ErrorHandling/ErrorBoundary";


interface BlaiseStatus {
    "health check type": string
    status: string
}

function StatusPage(): ReactElement {
    const [statusList, setStatusList] = useState<BlaiseStatus[]>([]);
    const [listError, setListError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingMessage, setLoadingMessage] = useState<string>("Checking Blaise status");

    useEffect(() => {
        setStatusList([]);
        setLoading(true);
        setTimeout(function () {
            if (loading) {
                setLoadingMessage("Looks like it's taking its time, best assume Blaise is not working.");
            }
        }, 10000);

        fetch("/api/health/diagnosis")
            .then((r: Response) => {
                if (r.status !== 503 && r.status !== 200) {
                    throw r.status + " - " + r.statusText;
                }
                r.json()
                    .then((json: BlaiseStatus[]) => {
                        if (!Array.isArray(json)) {
                            throw "Json response is not a list";
                        }
                        console.log("Retrieved blaise status list, " + json.length + " items/s");
                        console.log(json);
                        setStatusList(json);
                        setListError("");
                        if (json.length === 0) setListError("No connection details found.");
                    })
                    .catch((error) => {
                        console.error("Unable to read json from response, error: " + error);
                        setListError("Unable to get Blaise status");
                    });
            }).catch((error) => {
                console.error("Failed to retrieve Blaise status, error: " + error);
                setListError("Unable to get Blaise status");
            }
        ).finally(() => setLoading(false));
    }, []);


    function displayBlaiseStatus() {
        if (loading) {
            return <ONSLoadingPanel message={loadingMessage}/>;
        } else if (listError !== "") {
            return <ONSPanel>{listError}</ONSPanel>;
        }

        return (
            <ErrorBoundary errorMessageText={"Failed to load Blaise Status, best to assume its not working."}>
                <div className={"elementToFadeIn"}>
                    <dl className="metadata metadata__list grid grid--gutterless u-cf u-mb-l"
                        title="Status information for connections to Blaise"
                        aria-label="Status information for connections to Blaise">
                        {statusList.map((item: BlaiseStatus) => {
                            return (
                                <Fragment key={item["health check type"]}>
                                    <dt className="metadata__term grid__col col-5@m">
                                        {item["health check type"]}:
                                    </dt>
                                    <dd className="metadata__value grid__col col-7@m">
                                             <span
                                                 className={`status status--${(item.status === "OK" ? "success" : "error")}`}>
                                                 {item.status}
                                             </span>
                                    </dd>
                                </Fragment>
                            );
                        })}
                    </dl>
                </div>
            </ErrorBoundary>
        );
    }

    return (
        <>
            <p>
                <Link to={"/"}>Previous</Link>
            </p>
            <h1>Blaise connection status</h1>

            {displayBlaiseStatus()}
        </>
    );
}

export default StatusPage;
