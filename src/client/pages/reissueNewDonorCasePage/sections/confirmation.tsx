import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button, LoadingPanel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import axiosConfig from "../../../api/axiosConfig";

interface Props {
  questionnaireName: string;
  user: string;
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

function getApiErrorMessage(error: unknown): string {
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

function Confirmation({ questionnaireName, user, onSuccess }: Props): ReactElement {
  const navigate = useNavigate();

  const { mutate: reissueNewDonorCase, isPending: loading } = useMutation({
    mutationFn: async () => {
      const payload = { questionnaire_name: questionnaireName, user: user };

      try {
        const res = await axios.post(
          "/api/cloudFunction/reissueNewDonorCase",
          payload,
          axiosConfig(),
        );

        return { data: getApiSuccessMessage(res.data), status: res.status };
      } catch (error: unknown) {
        return { data: getApiErrorMessage(error), status: 500 };
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
              Reissue <span className="ons-highlight">{user}</span> a new donor case for{" "}
              <span className="ons-highlight">{questionnaireName}</span>?
            </h1>
            <div className="ons-btn-group ons-u-mt-m">
              <Button
                label="Continue"
                onClick={() => reissueNewDonorCase()}
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
