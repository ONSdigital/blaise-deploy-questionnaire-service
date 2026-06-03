import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button, LoadingPanel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import axiosConfig from "../../../api/axiosConfig";

interface Props {
  questionnaireName: string;
  role: string;
  onSuccess: (message: string, statusCode: number) => void;
}

function getApiSuccessMessage(data: unknown): string {
  if (typeof data === "string") {
    return data;
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message?: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }

  return "Success";
}

function getApiBodyStatus(data: unknown): number | undefined {
  if (
    typeof data === "object" &&
    data !== null &&
    "status" in data &&
    typeof (data as { status?: unknown }).status === "number"
  ) {
    return (data as { status: number }).status;
  }

  return undefined;
}

function getApiErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: unknown } }).response?.data === "string"
  ) {
    return (error as { response?: { data?: string } }).response!.data!;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message ===
      "string"
  ) {
    return (error as { response?: { data?: { message?: string } } }).response!.data!.message!;
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

        return {
          data: getApiSuccessMessage(res.data),
          status: getApiBodyStatus(res.data) ?? res.status,
        };
      } catch (error: unknown) {
        return { data: getApiErrorMessage(error), status: 500 };
      }
    },
    onSuccess: (res) => {
      onSuccess(res.data, res.status);
    },
  });

  if (loading) {
    return (
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        <div className="ons-grid">
          <div className="ons-grid__col ons-col-8@m">
            <LoadingPanel />
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        <div className="ons-grid">
          <div className="ons-grid__col ons-col-8@m">
            <h1 className="ons-u-mb-l">
              Create <strong className="ons-highlight">{role}</strong> donor cases for{" "}
              <span className="ons-highlight">{questionnaireName}</span>?
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
          </div>
        </div>
      </main>
    </>
  );
}

export { Confirmation };
