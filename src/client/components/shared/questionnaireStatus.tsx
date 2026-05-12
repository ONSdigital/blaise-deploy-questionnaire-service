import React, { type ReactElement } from "react";

interface Props {
  status: string;
}

function getStatusColor(status: string | undefined) {
  switch (status) {
    case "Active":
      return "success";
    case "Failed":
      return "error";
    default:
      return "info";
  }
}

export function QuestionnaireStatus({ status }: Props): ReactElement {
  return (
    <>
      <span className={`ons-status ons-status--${getStatusColor(status)}`}>{status}</span>
    </>
  );
}
