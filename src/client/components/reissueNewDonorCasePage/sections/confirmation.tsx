import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button, LoadingPanel } from "blaise-design-system-react-components";
import React, { type ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import axiosConfig from "../../../api/axiosConfig";

interface Props {
  questionnaireName: string;
  user: string;
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

function Confirmation({ questionnaireName, user, onSuccess }: Props): ReactElement {
  const navigate = useNavigate();

  const { mutate: reissueNewDonorCase, isPending: loading } = useMutation({
    mutationFn: async () => {
      // Keep both keys for compatibility with cloud function variants.
      const payload = { questionnaire_name: questionnaireName, user: user, role: user };

      try {
        const res = await axios.post(
          "/api/cloudFunction/reissueNewDonorCase",
          payload,
          axiosConfig(),
        );

        return { data: res.data, status: res.status };
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
              Reissue a new donor case for <em className="ons-highlight">{questionnaireName}</em> on
              behalf of <em className="ons-highlight">{user}</em>?
            </h1>
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
          </>
        }
      </main>
    </>
  );
}

export { Confirmation };
