import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, LoadingPanel, Panel } from "blaise-design-system-react-components";
import React, { type ReactElement, useRef, useState } from "react";

import { generateUacsAndCsvFileData } from "../../../api/processes";
import { getQuestionnaireModes } from "../../../api/questionnaires";
import { getUacCount } from "../../../api/uacs";
import { clientLogger } from "../../../utils/logger";

import type { Questionnaire } from "blaise-api-node-client";
import type { Datas } from "react-csv-downloader/dist/esm/lib/csv";

interface Props {
  questionnaire: Questionnaire;
  modes: string[];
}

const CawiModeDetails = ({ questionnaire, modes }: Props): ReactElement => {
  const isCawiQuestionnaire = modes.includes("CAWI");
  const queryClient = useQueryClient();
  const [uacGenerationFailed, setUacGenerationFailed] = useState<string>("");
  const downloadAnchorRef = useRef<HTMLAnchorElement>(null);

  const {
    data: fetchedModes = [],
    isLoading: modesLoading,
    error: modesError,
  } = useQuery({
    queryKey: ["questionnaireMode", questionnaire.name],
    queryFn: () => getQuestionnaireModes(questionnaire.name),
    enabled: isCawiQuestionnaire,
  });

  const {
    data: uacCount = 0,
    isLoading: uacCountLoading,
    error: uacCountError,
  } = useQuery({
    queryKey: ["uacCount", questionnaire.name],
    queryFn: async () => {
      const count = await getUacCount(questionnaire.name);

      return count ?? 0;
    },
    enabled: isCawiQuestionnaire,
  });

  const { mutate: generateUacs, isPending: uacsGenerating } = useMutation({
    mutationFn: async () => {
      const uacList = await generateUacsAndCsvFileData(questionnaire.name);

      clientLogger.info("Generated Unique Access Codes");

      return uacList;
    },
    onSuccess: (uacList) => {
      queryClient.invalidateQueries({ queryKey: ["uacCount", questionnaire.name] });
      triggerCsvDownload(uacList, `${questionnaire.name}-uac.csv`);
      setUacGenerationFailed("");
    },
    onError: () => {
      const userFriendlyError = "Error occurred while generating Unique Access Codes";

      setUacGenerationFailed(userFriendlyError);
      clientLogger.error(userFriendlyError);
    },
  });

  const handleDownloadClick = () => {
    setUacGenerationFailed("");
    generateUacs();
  };

  const triggerCsvDownload = (rows: Datas, filename: string) => {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]);
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((h) => escape((row as Record<string, unknown>)[h])).join(","),
      ),
    ];
    // BOM for Excel UTF-8 compatibility
    const csv = "\uFEFF" + lines.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const anchor = downloadAnchorRef.current;

    if (anchor) {
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
    }

    URL.revokeObjectURL(url);
  };

  const cawiMode = fetchedModes.includes("CAWI");
  const showGenerateUacsButton = (questionnaire.dataRecordCount ?? 0) > 0 || uacCount > 0;

  if (!isCawiQuestionnaire) {
    return <></>;
  }

  if (modesLoading) {
    return <LoadingPanel message="Getting web mode information" />;
  }

  if (modesError) {
    return (
      <Panel status={"error"}>
        <p>Failed to get Web mode details</p>
      </Panel>
    );
  }

  if (uacCountError) {
    return (
      <Panel status={"error"}>
        <p>
          Failed to connect to the Unique Access Codes service. Please check the service is running
          and try again.
        </p>
      </Panel>
    );
  }

  if (cawiMode) {
    return (
      <div className="ons-summary ons-u-mb-m ons-u-mt-m">
        <div className="ons-summary__group">
          <h2 className="ons-summary__group-title">CAWI mode details</h2>
          <dl className="ons-summary__items">
            {uacGenerationFailed !== "" && (
              <div className="ons-summary__item ons-summary__item--error">
                <dt className="ons-summary__item-title">
                  <div className="ons-summary__item--text">{uacGenerationFailed}</div>
                </dt>
                <dd className="ons-summary__values"></dd>
              </div>
            )}

            <div className="ons-summary__item">
              <dt className="ons-summary__item-title">
                <div className="ons-summary__item--text">Unique Access Codes generated</div>

                {showGenerateUacsButton && (
                  <div className="ons-u-mt-m ons-u-mb-s">
                    <a
                      ref={downloadAnchorRef}
                      style={{ display: "none" }}
                      aria-hidden="true"
                    />
                    <Button
                      label={"Generate and download Unique Access Codes"}
                      primary={false}
                      small={true}
                      loading={uacsGenerating}
                      onClick={handleDownloadClick}
                    />
                  </div>
                )}
              </dt>

              <dd className="ons-summary__values">
                <span className="ons-summary__text ons-u-fw-b">
                  {uacCountLoading ? "Loading..." : uacCount}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }

  return <></>;
};

export { CawiModeDetails };
