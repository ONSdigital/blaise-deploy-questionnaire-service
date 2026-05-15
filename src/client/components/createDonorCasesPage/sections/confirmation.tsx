import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button, LoadingPanel } from "blaise-design-system-react-components";
import React, { type ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import axiosConfig from "../../../api/axiosConfig";

interface Props {
  questionnaireName: string;
  role: string;
  onSuccess: (message: string, statusCode: number) => void;
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

function Confirmation({ questionnaireName, role, onSuccess }: Props): ReactElement {
  const navigate = useNavigate();

  const { mutate: createDonorCases, isPending: loading } = useMutation({
    mutationFn: async () => {
      const payload = { questionnaire_name: questionnaireName, role: role };

      try {
        const res = await axios.post("/api/cloudFunction/createDonorCases", payload, axiosConfig());

        return { data: res.data, status: res.status };
      } catch (error: unknown) {
        return { data: JSON.stringify(getApiErrorMessage(error)), status: 500 };
      }
    },
    onSuccess: (res) => {
      onSuccess(res.data, res.status);
    },
  });

  if (loading) {
    return <LoadingPanel />;
  }

  return (
    <>
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        {
          <>
            <h1 className="ons-u-mb-l">
              Create <em className="ons-highlight">{role}</em> donor cases for{" "}
              <em className="ons-highlight">{questionnaireName}</em>?
            </h1>
            <div className="ons-btn-group ons-u-mt-m">
              <Button
                label="Continue"
                onClick={() => createDonorCases()}
                primary
              />
              <Button
                label="Cancel"
                onClick={() => navigate(`/questionnaire/${questionnaireName}`)}
                primary={false}
              />
            </div>
          </>
        }
      </main>
    </>
  );
}

export { Confirmation };
