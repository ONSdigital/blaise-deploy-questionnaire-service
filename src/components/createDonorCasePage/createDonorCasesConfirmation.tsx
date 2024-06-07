import React, { ReactElement } from "react";
import { json, useLocation, useNavigate } from "react-router-dom";
import Breadcrumbs from "../breadcrumbs";
import { ONSButton } from "blaise-design-system-react-components";
import axios from "axios";
import { Questionnaire } from "blaise-api-node-client";

interface Location {
    questionnaire: Questionnaire;
    role: string;
}

function CreateDonorCasesConfirmation(): ReactElement {
    const location = useLocation().state as Location;
    const { questionnaire, role } = location || { questionnaire: "" };

    const navigate = useNavigate();

    async function callCreateDonorCasesCloudFunction() {
        const payload = { questionnaire_name: questionnaire, role: role }; // Your payload data here

        try {
            const response = await axios.post("/api/cloudFunction/createDonorCases", payload, {
                headers: {
                    "Content-Type": "application/json"
                },
            });
            // Navigate to the Response page after API call based on success or failure, TBD
            navigate(`/questionnaire/${questionnaire.name}`, { state: { donorCasesResponseMessage: response.data, donorCasesStatusCode: response.status, questionnaire: questionnaire, role: role } });
        } catch (error) {
            console.error("Error:", error);
            navigate(`/questionnaire/${questionnaire.name}`, { state: { donorCasesResponseMessage: "Error invoking cloud function", donorCasesStatusCode: 500, questionnaire: questionnaire, role: role } });
        }
    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" },
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
                            />
                            <ONSButton
                                label="Cancel"
                                onClick={() => navigate(-1)} primary={false} />
                        </>

                    )
                }
            </main>
        </>
    );
}

export default CreateDonorCasesConfirmation;
