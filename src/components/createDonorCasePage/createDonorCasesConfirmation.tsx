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
        const payload = { questionnaire_name: questionnaire.name, role: role }; // Your payload data here
        let res;
        try {
            res = await axios.post("/api/cloudFunction/createDonorCases", payload, {
                headers: {
                    "Content-Type": "application/json"
                },
            });
        } catch (error) {
            console.error(error);
            res = {
                data: "When reporting this issue to the Service Desk, please provide the questionnaire name, time and date of the failure.",
                status: 500
            };
        }
        navigate(`/questionnaire/${questionnaire.name}`, { state: { donorCasesResponseMessage: res.data, donorCasesStatusCode: res.status, questionnaire: questionnaire, role: role } });
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