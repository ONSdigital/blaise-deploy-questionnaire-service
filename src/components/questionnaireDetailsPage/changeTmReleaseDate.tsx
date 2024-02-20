import React, { ReactElement } from "react";
import { ONSButton } from "blaise-design-system-react-components";
import { setTMReleaseDate } from "../../client/tmReleaseDate";
import dateFormatter from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Formik } from "formik";
import AskToSetTMReleaseDate from "../uploadPage/sections/askToSetTMReleaseDate";
import Breadcrumbs from "../breadcrumbs";

interface LocationState {
    tmReleaseDate: string | null;
    questionnaireName: string;
}

function ChangeTMReleaseDate(): ReactElement {
    const navigate = useNavigate();
    const location = useLocation().state as LocationState;
    const { tmReleaseDate, questionnaireName } = location || { tmReleaseDate: null, questionnaireName: null };

    async function _handleSubmit(values: any, actions: any) {
        if (values.askToSetDate === "no") {
            values["set release date"] = "";
        }
        const liveDateCreated = await setTMReleaseDate(questionnaireName, values["set release date"]);
        if (!liveDateCreated) {
            console.log("Failed to store Totalmobile release date specified");
            return;
        }
        actions.setSubmitting(false);
        navigate(-1);
    }

    let initialValues = {
        askToSetDate: "",
        "set release date": ""
    };

    if (tmReleaseDate != null) {
        initialValues = {
            askToSetDate: "yes",
            "set release date": dateFormatter(tmReleaseDate).format("YYYY-MM-DD")
        };
    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" }, { link: `/questionnaire/${questionnaireName}`, title: questionnaireName }
                ]
            } />

            <main id="main-content" className="ons-page__main ons-u-mt-no">
                <Formik
                    validateOnBlur={false}
                    validateOnChange={false}
                    initialValues={initialValues}
                    onSubmit={_handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form id={"formID"}>
                            <AskToSetTMReleaseDate questionnaireName={questionnaireName} />

                            <div className="ons-btn-group ons-u-mt-m">
                                <ONSButton
                                    id={"continue-deploy-button"}
                                    submit={true}
                                    loading={isSubmitting}
                                    primary={true} label={"Continue"} />
                                {!isSubmitting && (
                                    <ONSButton
                                        id={"cancel-deploy-button"}
                                        onClick={() => navigate(-1)}
                                        primary={false} label={"Cancel"} />
                                )}
                            </div>

                        </Form>
                    )}
                </Formik>
            </main>
        </>
    );
}

export default ChangeTMReleaseDate;
