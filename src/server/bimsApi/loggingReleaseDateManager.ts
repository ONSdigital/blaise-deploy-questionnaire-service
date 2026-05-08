import dateFormatter from "dayjs";

import { type TmReleaseDate } from "./bimsApi.js";
import { type Logger } from "./logger.js";
import { type ReleaseDateManager } from "./releaseDateManager.js";

export default class LoggingReleaseDateManager implements ReleaseDateManager {
  private previousReleaseDate: Map<string, string> = new Map();

  constructor(
    private readonly instance: ReleaseDateManager,
    private readonly logger: Logger,
    private readonly username: string,
  ) {}

  createReleaseDate(questionnaireName: string, releaseDate: string): Promise<TmReleaseDate> {
    return this.performActionAndLog(
      () => this.instance.createReleaseDate(questionnaireName, releaseDate),
      `Totalmobile release date set to ${releaseDate} for ${questionnaireName} by ${this.username}`,
      `Failed to set TM release date to ${releaseDate} for questionnaire ${questionnaireName} (user: ${this.username})`,
      questionnaireName,
    );
  }

  deleteReleaseDate(questionnaireName: string): Promise<void> {
    return this.performActionAndLog(
      () => this.instance.deleteReleaseDate(questionnaireName),
      `Totalmobile release date deleted{previous} for ${questionnaireName} by ${this.username}`,
      `Failed to remove TM release date for questionnaire ${questionnaireName} (user: ${this.username})`,
      questionnaireName,
    );
  }

  async getReleaseDate(questionnaireName: string): Promise<TmReleaseDate | undefined> {
    const releaseDate = await this.instance.getReleaseDate(questionnaireName);

    if (releaseDate && releaseDate.tmreleasedate) {
      this.previousReleaseDate.set(questionnaireName, releaseDate.tmreleasedate);
    }

    return releaseDate;
  }

  updateReleaseDate(questionnaireName: string, releaseDate: string): Promise<TmReleaseDate> {
    return this.performActionAndLog(
      () => this.instance.updateReleaseDate(questionnaireName, releaseDate),
      `Totalmobile release date updated to ${releaseDate}{previous} for ${questionnaireName} by ${this.username}`,
      `Failed to set TM release date to ${releaseDate} for questionnaire ${questionnaireName} (user: ${this.username})`,
      questionnaireName,
    );
  }

  private async performActionAndLog<Result>(
    action: () => Promise<Result>,
    successMessage: string,
    errorMessage: string,
    questionnaireName: string,
  ): Promise<Result> {
    const prepareMessage = (successMessage: string) => {
      let previous = "";

      if (this.previousReleaseDate.has(questionnaireName)) {
        previous = ` (previously ${dateFormatter(this.previousReleaseDate.get(questionnaireName)).format("YYYY-MM-DD")})`;
      }

      return successMessage.replace("{previous}", previous);
    };

    try {
      const result = await action();

      this.logger.info(prepareMessage(successMessage));

      return result;
    } catch (error) {
      this.logger.error(prepareMessage(errorMessage));
      throw error;
    }
  }
}
