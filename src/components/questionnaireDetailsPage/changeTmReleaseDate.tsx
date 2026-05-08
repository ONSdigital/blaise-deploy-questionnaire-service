import { Button } from "blaise-design-system-react-components";
import dateFormatter from "dayjs";
import { Form, Formik, type FormikHelpers } from "formik";
import React, { type ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { clientLogger } from "../../client/logger";
import { setTmReleaseDate } from "../../client/tmReleaseDate";
import Breadcrumbs from "../breadcrumbs";
import AskToSetTmReleaseDate from "../uploadPage/sections/askToSetTmReleaseDate";

interface LocationState {
  tmReleaseDate: string | null;
  questionnaireName: string;
}

type TmReleaseDateFormValues = {
  askToSetDate: string;
  "set release date": string;
};

function ChangeTmReleaseDate(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation().state as LocationState;
  const { tmReleaseDate, questionnaireName } = location || {
    tmReleaseDate: null,
    questionnaireName: null,
  };

  async function handleSubmit(
    values: TmReleaseDateFormValues,
    actions: FormikHelpers<TmReleaseDateFormValues>,
  ) {
    if (values.askToSetDate === "no") {
      values["set release date"] = "";
    }

    const liveDateCreated = await setTmReleaseDate(questionnaireName, values["set release date"]);

    if (!liveDateCreated) {
      clientLogger.info("Failed to store Totalmobile release date specified");

      return;
    }

    actions.setSubmitting(false);
    navigate(-1);
  }

  let initialValues = {
    askToSetDate: "",
    "set release date": "",
  };

  if (tmReleaseDate != null) {
    initialValues = {
      askToSetDate: "yes",
      "set release date": dateFormatter(tmReleaseDate).format("YYYY-MM-DD"),
    };
  }

  return (
    <>
      <Breadcrumbs
        breadcrumbList={[
          { link: "/", title: "Home" },
          { link: `/questionnaire/${questionnaireName}`, title: questionnaireName },
        ]}
      />

      <main
        id="main-content"
        className="ons-page__main ons-u-mt-no"
      >
        <Formik
          validateOnBlur={false}
          validateOnChange={false}
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form id={"formID"}>
              <AskToSetTmReleaseDate questionnaireName={questionnaireName} />

              <div className="ons-btn-group ons-u-mt-m">
                <Button
                  id={"continue-deploy-button"}
                  submit={true}
                  loading={isSubmitting}
                  primary={true}
                  label={"Continue"}
                />
                {!isSubmitting && (
                  <Button
                    id={"cancel-deploy-button"}
                    onClick={() => navigate(-1)}
                    primary={false}
                    label={"Cancel"}
                  />
                )}
              </div>
            </Form>
          )}
        </Formik>
      </main>
    </>
  );
}

export default ChangeTmReleaseDate;
