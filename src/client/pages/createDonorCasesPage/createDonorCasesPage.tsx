import { type ReactElement } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

import { decodeRouteParam } from "../../utils/decodeRouteParam";
import { readStateQuestionnaire, readStateString } from "../../utils/locationState";

import { Confirmation } from "./sections/confirmation";

function CreateDonorCasesPage(): ReactElement {
  const navigate = useNavigate();
  const routeParams = useParams();
  const location = useLocation();
  const questionnaireName = routeParams.questionnaireName ?? "";
  const questionnaire = readStateQuestionnaire(location.state, "questionnaire");
  const role = decodeRouteParam(routeParams.role) ?? readStateString(location.state, "role") ?? "";

  if (!questionnaireName || !role) {
    return (
      <Navigate
        to={questionnaireName ? `/questionnaire/${questionnaireName}` : "/"}
        replace={true}
      />
    );
  }

  const handleSuccess = (message: string, code: number): void => {
    navigate(`/questionnaire/${questionnaireName}`, {
      state: {
        section: "createDonorCases",
        questionnaire: questionnaire ?? null,
        responseMessage: message,
        statusCode: code,
        role,
      },
      replace: true,
    });
  };

  return (
    <Confirmation
      questionnaireName={questionnaireName}
      role={role}
      onSuccess={handleSuccess}
    />
  );
}

export default CreateDonorCasesPage;
