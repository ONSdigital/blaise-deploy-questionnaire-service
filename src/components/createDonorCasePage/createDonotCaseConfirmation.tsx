import React, { ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Questionnaire } from "blaise-api-node-client";
import ErroneousWarning from "../deletePage/erroneousWarning";
import DeleteWarning from "../deletePage/deleteWarning";
import Breadcrumbs from "../breadcrumbs";
import { ONSButton } from "blaise-design-system-react-components";
import axios from "axios";

interface Location {
    questionnaire: Questionnaire;
    role: string;
}

function CreateDonorCasesConfirmation(): ReactElement {
    const location = useLocation().state as Location;
    const { questionnaire, role } = location || { questionnaire: "", role: "" };
    const navigate = useNavigate();

    async function callCreateDonorCasesCloudFunction() {
        const payload = { questionnaire_name: questionnaire.name, role: role }; // Your payload data here

        try {
            const response = await axios.post("/api/cloudFunction/createDonorCases", payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log("Response:", response.data);
            // Navigate to the target page after successful API call
            navigate("/home");
        } catch (error) {
            console.error("Error:", error);
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
                                onClick={function willImplementLater() { }} primary={false} />
                        </>

                    )
                }
            </main>
        </>
    );
}

export default CreateDonorCasesConfirmation;
