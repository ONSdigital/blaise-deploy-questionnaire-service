import type { Questionnaire } from "blaise-api-node-client";
import { Button, LoadingPanel, Panel } from "blaise-design-system-react-components";
import React, { type ReactElement, useCallback, useEffect, useRef, useState } from "react";
import type { Datas } from "react-csv-downloader/dist/esm/lib/csv";

import { generateUacsAndCsvFileData } from "../../../client/componentProcesses";
import { clientLogger } from "../../../client/logger";
import { getQuestionnaireModes } from "../../../client/questionnaires";
import { getUacCount } from "../../../client/uacs";

interface Props {
  questionnaire: Questionnaire;
  modes: string[];
}

const CawiModeDetails = ({ questionnaire, modes }: Props): ReactElement => {
  const isCawiQuestionnaire = modes.includes("CAWI");

  const [errored, setErrored] = useState<boolean>(false);
  const [cawiMode, setCawiMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>("Getting web mode information");
  const [uacCount, setUacCount] = useState<number>(0);
  const [uacCountFailed, setUacCountFailed] = useState<boolean>(false);
  const [uacGenerationFailed, setUacGenerationFailed] = useState<string>("");
  const downloadAnchorRef = useRef<HTMLAnchorElement>(null);
  const showGenerateUacsButton = (questionnaire.dataRecordCount ?? 0) > 0 || uacCount > 0;

  const fetchUacCount = useCallback((onInitialLoad = false) => {
    getUacCount(questionnaire.name)
      .then((count) => {
        clientLogger.info(`count: ${count}`);
        if (count !== null) setUacCount(count);
        setUacCountFailed(false);
      })
      .catch(() => {
        clientLogger.error("Failed to get UAC count");
        if (onInitialLoad) setUacCountFailed(true);
      });
  }, [questionnaire.name]);

  async function handleDownloadClick() {
    setLoading(true);
    setLoadingMessage("Generating Unique Access Codes for cases");
    setUacGenerationFailed("");

    try {
      const uacList = await generateUacsAndCsvFileData(questionnaire.name);

      clientLogger.info("Generated UAC Codes");
      fetchUacCount(false);
      triggerCsvDownload(uacList, `${questionnaire.name}-uac-codes.csv`);
    } catch (error) {
      const userFriendlyError = "Error occurred while generating Unique Access Codes";

      setUacGenerationFailed(userFriendlyError);
      clientLogger.error(error);
      clientLogger.error(userFriendlyError);
    } finally {
      setLoading(false);
    }
  }

  function triggerCsvDownload(rows: Datas, filename: string) {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]);
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [
      headers.join(","),
      ...rows.map((row) => headers.map((h) => escape((row as Record<string, unknown>)[h])).join(",")),
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
  }

  useEffect(() => {
    if (!isCawiQuestionnaire) {
      return;
    }

    getQuestionnaireModes(questionnaire.name)
      .then((fetchedModes: string[]) => {
        if (fetchedModes.includes("CAWI")) {
          setCawiMode(true);
        }
      })
      .catch(() => {
        queueMicrotask(() => {
          setErrored(true);
        });
      })
      .finally(() => setLoading(false));

    fetchUacCount(true);
  }, [fetchUacCount, isCawiQuestionnaire, questionnaire.name]);

  if (!isCawiQuestionnaire) {
    return (
      <div className="ons-summary ons-u-mb-m elementToFadeIn ons-u-mt-m">
        <div className="ons-summary__group">
          <h2 className="ons-summary__group-title">Web mode details</h2>
          <dl className="ons-summary__items">
            <div className="ons-summary__item">
              <dt className="ons-summary__item-title">
                <div className="ons-summary__item--text">
                  Does this questionnaire have a Web mode?
                </div>
              </dt>
              <dd className="ons-summary__values">
                <span className="ons-summary__text">No</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingPanel message={loadingMessage} />;
  }

  if (errored) {
    return (
      <Panel status={"error"}>
        <p>Failed to get Web mode details</p>
      </Panel>
    );
  }

  if (uacCountFailed) {
    return (
      <Panel status={"error"}>
        <p>Failed to connect to the UAC service. Please check the service is running and try again.</p>
      </Panel>
    );
  }

  if (cawiMode) {
    return (
      <div className="ons-summary ons-u-mb-m elementToFadeIn ons-u-mt-m">
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
              {/* CHANGED: Moved the Button inside the left-aligned Title Column */}
              <dt className="ons-summary__item-title">
                <div className="ons-summary__item--text">Unique Access Codes generated</div>

                {showGenerateUacsButton && (
                  <div className="ons-u-mt-m ons-u-mb-s">
                    {/* Hidden anchor used to trigger CSV file download */}
                    {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
                    <a ref={downloadAnchorRef} style={{ display: "none" }} aria-hidden="true" />
                    <Button
                      label={"Generate and download Unique Access Codes"}
                      primary={false}
                      small={true}
                      loading={loading}
                      onClick={handleDownloadClick}
                    />
                  </div>
                )}
              </dt>

              {/* Column 2: Values (Just the bold count) */}
              <dd className="ons-summary__values">
                <span className="ons-summary__text ons-u-fw-b">{uacCount}</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }

  return <></>;
};

export default CawiModeDetails;
