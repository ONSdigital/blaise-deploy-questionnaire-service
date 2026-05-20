import { useQueryClient } from "@tanstack/react-query";
import { type ReactElement } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

import { getQuestionnaire } from "../../api/questionnaires";
import { decodeRouteParam } from "../../utils/decodeRouteParam";
import { readStateQuestionnaire, readStateString } from "../../utils/locationState";

import { Confirmation } from "./sections/confirmation";

function ReissueNewDonorCasePage(): ReactElement {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const routeParams = useParams();
  const location = useLocation();
  const questionnaireName = routeParams.questionnaireName ?? "";
  const decodedRouteUser = decodeRouteParam(routeParams.user);
  // Changed: narrow router state explicitly so invalid navigation state cannot leak into route parameters.
  const questionnaireFromState = readStateQuestionnaire(location.state, "questionnaire");
  const user = decodedRouteUser ?? readStateString(location.state, "user") ?? "";

  if (!questionnaireName || !user) {
    return (
      <Navigate
        to={questionnaireName ? `/questionnaire/${questionnaireName}` : "/"}
        replace={true}
      />
    );
  }

  const handleSuccess = (message: string, code: number): void => {
    void (async () => {
      let questionnaire = questionnaireFromState ?? null;

      if (!questionnaire) {
        try {
          questionnaire =
            (await queryClient.fetchQuery({
              queryKey: ["questionnaire", questionnaireName],
              queryFn: () => getQuestionnaire(questionnaireName),
            })) ?? null;
        } catch {
          questionnaire = null;
        }
      }

      navigate(`/questionnaire/${questionnaireName}`, {
        state: {
          section: "reissueNewDonorCase",
          questionnaire,
          responseMessage: message,
          statusCode: code,
          user,
        },
        replace: true,
      });
    })();
  };

  return (
    <Confirmation
      questionnaireName={questionnaireName}
      user={user}
      onSuccess={handleSuccess}
    />
  );
}

export default ReissueNewDonorCasePage;
