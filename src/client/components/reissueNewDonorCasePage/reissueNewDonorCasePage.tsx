import React, { type ReactElement } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

import { decodeRouteParam } from "../../utils/decodeRouteParam";

import { Confirmation } from "./sections/confirmation";

import type { Questionnaire } from "blaise-api-node-client";

interface Location {
  questionnaire?: Questionnaire;
  user?: string;
  section?: string;
  responseMessage?: string;
  statusCode?: number;
}

function ReissueNewDonorCasePage(): ReactElement {
  const navigate = useNavigate();
  const routeParams = useParams();
  const location = useLocation().state as Location | undefined;
  const questionnaireName = routeParams.questionnaireName ?? "";
  const decodedRouteUser = decodeRouteParam(routeParams.user);
  const user = decodedRouteUser ?? location?.user ?? "";

  if (!questionnaireName || !user) {
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
        section: "reissueNewDonorCase",
        questionnaire: location?.questionnaire ?? null,
        responseMessage: message,
        statusCode: code,
        role: user,
      },
      replace: true,
    });
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
