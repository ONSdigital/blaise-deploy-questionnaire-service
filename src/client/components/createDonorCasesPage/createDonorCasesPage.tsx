import { type ReactElement } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

import { decodeRouteParam } from "../../utils/decodeRouteParam";

import { Confirmation } from "./sections/confirmation";

import type { Questionnaire } from "blaise-api-node-client";

interface Location {
  questionnaire?: Questionnaire;
  role?: string;
  section?: string;
  responseMessage?: string;
  statusCode?: number;
}

function CreateDonorCasesPage(): ReactElement {
  const navigate = useNavigate();
  const routeParams = useParams();
  const location = useLocation().state as Location | undefined;
  const questionnaireName = routeParams.questionnaireName ?? "";
  const role = decodeRouteParam(routeParams.role) ?? location?.role ?? "";

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
        questionnaire: location?.questionnaire ?? null,
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
