import React, { ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Breadcrumbs from "../breadcrumbs";
import { ONSButton, ONSLoadingPanel } from "blaise-design-system-react-components";
import axios from "axios";
import { Questionnaire } from "blaise-api-node-client";
import axiosConfig from "../../client/axiosConfig";

interface Location {
    questionnaire: Questionnaire;
    role: string;
}

function CreateDonorCasesConfirmation(): ReactElement {
    const location = useLocation().state as Location;
    const { questionnaire, role } = location || { questionnaire: "" };

    const navigate = useNavigate();

    const [loading, isLoading] = React.useState(false);

    async function callCreateDonorCasesCloudFunction() {
        isLoading(true);
        const payload = { questionnaire_name: questionnaire.name, role: role };
        let res;
        try {
            res = await axios.post("/api/cloudFunction/createDonorCases", payload, axiosConfig());
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