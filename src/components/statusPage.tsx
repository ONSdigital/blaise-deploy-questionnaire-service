import axios, { AxiosResponse } from "axios";
import { ErrorBoundary, ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import React, { Fragment, ReactElement, useEffect, useState } from "react";
import axiosConfig from "../client/axiosConfig";
import Breadcrumbs from "./breadcrumbs";


interface BlaiseStatus {
    "health check type": string;
    status: string;
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

        axios.get("/api/health/diagnosis", axiosConfig()).then((response: AxiosResponse) => {
            if (response.status !== 503 && response.status !== 200) {
                setListError("Unable to get Blaise status");
                return;
            }
            if (!Array.isArray(response.data)) {
                setListError("Unable to get Blaise status");
                return;
            }
            if (response.data.length === 0) {
                setListError("No connection details found.");
                return;
            }
            setStatusList(response.data);
            setListError("");
        }).catch((error) => {
            console.error("Failed to retrieve Blaise status, error: " + error);
            setListError("Unable to get Blaise status");
        }).finally(() => setLoading(false));
    }, []);


    function DisplayBlaiseStatus(): ReactElement {
        if (loading) {
            return <ONSLoadingPanel message={loadingMessage} />;
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
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" },
                ]
            } />

            <main id="main-content" className="page__main u-mt-no">
                <h1 className="u-mb-l">Blaise connection status</h1>

                <DisplayBlaiseStatus />
            </main>
        </>
    );
}

export default StatusPage;
