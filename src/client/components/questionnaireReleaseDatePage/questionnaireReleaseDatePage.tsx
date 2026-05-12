import { useQueryClient } from "@tanstack/react-query";
import { Button } from "blaise-design-system-react-components";
import dateFormatter from "dayjs";
import { Form, Formik, type FormikHelpers } from "formik";
import React, { type ReactElement } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { setTmReleaseDate } from "../../api/tmReleaseDate";
import { clientLogger } from "../../utils/logger";
import { AskReleaseDate } from "../shared/dateQuestions/askReleaseDate";

interface LocationState {
  tmReleaseDate: string | null;
  questionnaireName?: string;
}

type TmReleaseDateFormValues = {
  askToSetDate: string;
  "set release date": string;
};

function QuestionnaireReleaseDatePage(): ReactElement {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const routeParams = useParams();
  const location = useLocation().state as LocationState | undefined;
  const { tmReleaseDate, questionnaireName: questionnaireNameFromState } = location || {
    tmReleaseDate: null,
    questionnaireName: null,
  };
  const questionnaireName = routeParams.questionnaireName ?? questionnaireNameFromState ?? "";

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
    void queryClient.invalidateQueries({ queryKey: ["tmReleaseDate", questionnaireName] });
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
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        <Formik
          validateOnBlur={false}
          validateOnChange={false}
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form id={"formID"}>
              <AskReleaseDate questionnaireName={questionnaireName} />

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

export default QuestionnaireReleaseDatePage;
