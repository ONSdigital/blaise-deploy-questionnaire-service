import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  ErrorBoundary,
  LoadingPanel,
  Panel,
  Select,
} from "blaise-design-system-react-components";
import { type ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";

import { verifyAndInstallQuestionnaire } from "../../api/processes";
import { getQuestionnaires } from "../../api/questionnaires";
import { getAllQuestionnairesInBucket } from "../../api/upload";
import { clientLogger } from "../../utils/logger";
import { DeploymentOutcome } from "../shared/deploymentOutcome";

function ReinstallQuestionnaires(): ReactElement {
  const [questionnaireToInstall, setQuestionnaireToInstall] = useState<string>("");
  const [outcome, setOutcome] = useState<{ questionnaireName: string; status: string } | null>(
    null,
  );
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: questionnaireList = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["reinstallList"],
    queryFn: async () => {
      // Fetch files in bucket and questionnaires installed in parallel for speed
      const [bucketList, installedQuestionnaires] = await Promise.all([
        getAllQuestionnairesInBucket().catch(() => {
          throw new Error("Unable to load questionnaires from bucket. Check bucket permissions.");
        }),
        getQuestionnaires().catch((error: unknown) => {
          clientLogger.warn(
            `getQuestionnaires() failed while loading reinstall candidates: ${error}`,
          );

          return [] as Awaited<ReturnType<typeof getQuestionnaires>>;
        }),
      ]);

      const installedNames = installedQuestionnaires.map((q) => `${q.name}.bpkg`);
      const available = bucketList.filter((item) => !installedNames.includes(item));

      if (available.length === 0) {
        throw new Error("No compatible previously installed questionnaires found.");
      }

      return available;
    },
  });

  const { mutate: installQuestionnaire, isPending: installing } = useMutation({
    mutationFn: () => verifyAndInstallQuestionnaire(questionnaireToInstall),
    onSuccess: ([installed, message]) => {
      setOutcome({
        questionnaireName: questionnaireToInstall.replace(/\.[a-zA-Z]*$/, ""),
        status: installed ? "" : message,
      });
    },
  });

  return (
    <>
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-l"
      >
        <div className="ons-grid">
          <div className="ons-grid__col ons-col-8@m">
            {outcome ? (
              <DeploymentOutcome
                questionnaireName={outcome.questionnaireName}
                status={outcome.status}
                onRetry={() => setOutcome(null)}
                retryLabel="Return to reinstall questionnaire"
                onViewQuestionnaires={() => {
                  void queryClient.invalidateQueries({ queryKey: ["questionnaires"] });
                  navigate("/");
                }}
              />
            ) : (
              <>
                <h1 className="ons-u-mb-l">Reinstall questionnaire</h1>
                <p>
                  Reinstall a previously uploaded questionnaire. This will deploy the last uploaded
                  version of the questionnaire.
                </p>
                {isLoading ? (
                  <LoadingPanel />
                ) : (
                  <div>
                    <ErrorBoundary errorMessageText={"Failed to get questionnaires."}>
                      <form>
                        {error ? (
                          <Panel spacious={true}>{(error as Error).message}</Panel>
                        ) : (
                          <>
                            <Select
                              id="reinstall-questionnaire-select"
                              label="Select a questionnaire to reinstall"
                              value={questionnaireToInstall}
                              onChange={(event) => setQuestionnaireToInstall(event.target.value)}
                              options={questionnaireList
                                .slice()
                                .sort((a, b) => a.localeCompare(b))
                                .map((item) => ({
                                  label: item,
                                  value: item,
                                }))}
                            />
                            <div className="ons-btn-group ons-u-mt-m">
                              <Button
                                label={"Continue"}
                                primary={true}
                                disabled={questionnaireToInstall === ""}
                                loading={installing}
                                id="confirm-install"
                                onClick={() => installQuestionnaire()}
                              />
                              <Button
                                id={"cancel-reinstall"}
                                onClick={() => navigate("/")}
                                primary={false}
                                label={"Cancel"}
                              />
                            </div>
                          </>
                        )}
                      </form>
                    </ErrorBoundary>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default ReinstallQuestionnaires;
