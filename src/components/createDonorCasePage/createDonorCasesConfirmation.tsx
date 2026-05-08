import axios from "axios";
import type { Questionnaire } from "blaise-api-node-client";
import { Button, LoadingPanel } from "blaise-design-system-react-components";
import React, { type ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import axiosConfig from "../../client/axiosConfig";
import Breadcrumbs from "../breadcrumbs";

interface Location {
  questionnaire: Questionnaire;
  role: string;
}

function getApiErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message ===
      "string"
  ) {
    return (
      (error as { response?: { data?: { message?: string } } }).response?.data?.message ??
      "Unknown error"
    );
  }

  return "Unknown error";
}

function CreateDonorCasesConfirmation(): ReactElement {
  const location = useLocation().state as Location;
  const { questionnaire, role } = location || { questionnaire: "" };

  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(false);

  async function callCreateDonorCasesCloudFunction() {
    setLoading(true);
    const payload = { questionnaire_name: questionnaire.name, role: role };
    let res;

    try {
      res = await axios.post("/api/cloudFunction/createDonorCases", payload, axiosConfig());
    } catch (error: unknown) {
      const errorMessage = JSON.stringify(getApiErrorMessage(error));

      res = {
        data: errorMessage,
        status: 500,
      };
    }

    setLoading(false);
    navigate(`/questionnaire/${questionnaire.name}`, {
      state: {
        section: "createDonorCases",
        responseMessage: res.data,
        statusCode: res.status,
        questionnaire: questionnaire,
        role: role,
      },
    });
  }

  if (loading) {
    return <LoadingPanel />;
  }

  return (
    <>
      <Breadcrumbs
        breadcrumbList={[
          { link: "/", title: "Home" },
          { link: `/questionnaire/${questionnaire.name}`, title: questionnaire.name },
        ]}
      />

      <main
        id="main-content"
        className="ons-page__main ons-u-mt-no"
      >
        {
          <>
            <h1 className="ons-u-mb-l">
              Create {role} donor cases for {questionnaire.name}?
            </h1>
            <Button
              label="Continue"
              onClick={callCreateDonorCasesCloudFunction}
              primary
              disabled={loading}
            />
            <Button
              label="Cancel"
              onClick={() =>
                navigate(`/questionnaire/${questionnaire.name}`, {
                  state: {
                    section: "createDonorCases",
                    responseMessage: "",
                    statusCode: 0,
                    questionnaire: questionnaire,
                    role: "",
                  },
                })
              }
              primary={false}
            />
          </>
        }
      </main>
    </>
  );
}

export default CreateDonorCasesConfirmation;
