import React, { ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Breadcrumbs from "../breadcrumbs";
import { ONSButton, ONSLoadingPanel } from "blaise-design-system-react-components";
import axios from "axios";
import { Questionnaire } from "blaise-api-node-client";
import axiosRetry from "axios-retry";

interface Location {
    questionnaire: Questionnaire;
    role: string;
}

function CreateDonorCasesConfirmation(): ReactElement {
    const location = useLocation().state as Location;
    const { questionnaire, role } = location || { questionnaire: "" };

    const navigate = useNavigate();

    const [loading, isLoading] = React.useState(false);

    // Configure axios-retry to retry failed requests.
    // This is a ChatGPT solution which was verified against https://www.npmjs.com/package/axios-retry
    axiosRetry(axios, {
        retries: 3, // Number of retry attempts
        retryDelay: (retryCount) => {
            return retryCount * 1000;   // Delay between retries (in milliseconds)
        },
        retryCondition: (error) => {
            // Retry only if the request fails with a status of 500 or higher
            // @ts-ignore
            return error.response?.status >= 500;
        },
    });
    
    async function callCreateDonorCasesCloudFunction() {
        isLoading(true);
        const payload = { questionnaire_name: questionnaire.name, role: role };
        let res;
        try {
            res = await axios.post("/api/cloudFunction/createDonorCases", payload, {
                headers: {
                    "Content-Type": "application/json"
                },
            });
        } catch (error) {
            const errorMessage = JSON.stringify((error as any).response.data.message);
            res = {
                data: errorMessage,
                status: 500
            };
        }
        isLoading(false);
        navigate(`/questionnaire/${questionnaire.name}`, { state: { donorCasesResponseMessage: res.data, donorCasesStatusCode: res.status, questionnaire: questionnaire, role: role } });
    }
    if (loading) {
        return <ONSLoadingPanel />;
    }
    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" }, { link: `/questionnaire/${questionnaire.name}`, title: questionnaire.name }
                ]
            } />

            <main id="main-content" className="ons-page__main ons-u-mt-no">
                {
                    (
                        <>
                            <h1 className="u-mb-l">
                                Create {role} donor cases for {questionnaire.name}?
                            </h1>
                            <ONSButton
                                label="Continue"
                                onClick={callCreateDonorCasesCloudFunction}
                                primary
                                disabled={loading}
                            />
                            <ONSButton
                                label="Cancel"
                                onClick={() => navigate(`/questionnaire/${questionnaire.name}`, { state: { donorCasesResponseMessage: "", donorCasesStatusCode: 0, questionnaire: questionnaire, role: "" } })} primary={false} />
                        </>
                    )
                }
            </main>
        </>
    );
}

export default CreateDonorCasesConfirmation;