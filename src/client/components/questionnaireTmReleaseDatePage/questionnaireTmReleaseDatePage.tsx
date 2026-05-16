import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, LoadingPanel, Panel } from "blaise-design-system-react-components";
import dateFormatter from "dayjs";
import { Form, Formik, type FormikHelpers } from "formik";
import { type ReactElement } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { getTmReleaseDate, setTmReleaseDate } from "../../api/tmReleaseDate";
import { clientLogger } from "../../utils/logger";
import { AskTmReleaseDate } from "../shared/dateQuestions/askTmReleaseDate";

interface LocationState {
  tmReleaseDate: string | null;
  questionnaireName?: string;
}

type TmReleaseDateFormValues = {
  askDate: string;
  tmReleaseDate: string;
};

function QuestionnaireTmReleaseDatePage(): ReactElement {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const routeParams = useParams();
  const location = useLocation().state as LocationState | undefined;
  const tmReleaseDateFromState = location?.tmReleaseDate;
  const questionnaireNameFromState = location?.questionnaireName;
  const questionnaireName = routeParams.questionnaireName ?? questionnaireNameFromState ?? "";

  const {
    data: fetchedTmReleaseDate = "",
    isLoading: tmReleaseDateLoading,
    error: tmReleaseDateError,
  } = useQuery({
    queryKey: ["tmReleaseDate", questionnaireName],
    queryFn: () => getTmReleaseDate(questionnaireName),
    enabled: !!questionnaireName && tmReleaseDateFromState === undefined,
  });

  const tmReleaseDate =
    tmReleaseDateFromState === undefined
      ? fetchedTmReleaseDate === ""
        ? null
        : fetchedTmReleaseDate
      : tmReleaseDateFromState;

  function navigateBackToQuestionnaire(): void {
    if (questionnaireName) {
      navigate(`/questionnaire/${questionnaireName}`, { replace: true });

      return;
    }

    navigate(-1);
  }

  async function handleSubmit(
    values: TmReleaseDateFormValues,
    actions: FormikHelpers<TmReleaseDateFormValues>,
  ) {
    if (values.askDate === "no") {
      values.tmReleaseDate = "";
    }

    const tmReleaseDateCreated = await setTmReleaseDate(questionnaireName, values.tmReleaseDate);

    if (!tmReleaseDateCreated) {
      clientLogger.error("Failed to store Totalmobile release date");

      return;
    }

    actions.setSubmitting(false);
    void queryClient.invalidateQueries({ queryKey: ["tmReleaseDate", questionnaireName] });
    navigateBackToQuestionnaire();
  }

  let initialValues = {
    askDate: "",
    tmReleaseDate: "",
  };

  if (questionnaireName && tmReleaseDateLoading) {
    return (
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        <LoadingPanel message={"Getting Totalmobile release date"} />
      </main>
    );
  }

  if (questionnaireName && tmReleaseDateError) {
    return (
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        <Panel status="error">Failed to get Totalmobile release date</Panel>
      </main>
    );
  }

  if (tmReleaseDate != null) {
    initialValues = {
      askDate: "yes",
      tmReleaseDate: dateFormatter(tmReleaseDate).format("YYYY-MM-DD"),
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
          enableReinitialize={true}
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form id={"formID"}>
              <AskTmReleaseDate questionnaireName={questionnaireName} />

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
                    onClick={navigateBackToQuestionnaire}
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

export default QuestionnaireTmReleaseDatePage;
