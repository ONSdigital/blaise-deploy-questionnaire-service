import { ReleaseDateManager } from "./releaseDateManager";
import { tmReleaseDate } from "./bimsApi";
import { Logger } from "./logger";
import dateFormatter from "dayjs";

export default class LoggingReleaseDateManager implements ReleaseDateManager {
    private previousReleaseDate: Map<string, string> = new Map();

    constructor(private readonly instance: ReleaseDateManager, private readonly logger: Logger, private readonly username: string) {
    }

    createReleaseDate(questionnaireName: string, releaseDate: string): Promise<tmReleaseDate> {
        return this.performActionAndLog(
            () => this.instance.createReleaseDate(questionnaireName, releaseDate),
            `Totalmobile release date set to ${releaseDate} for ${questionnaireName} by ${this.username}`,
            `Failed to set TM release date to ${releaseDate} for questionnaire ${questionnaireName}`
        );
    }

    deleteReleaseDate(questionnaireName: string): Promise<void> {
        let successMessage = `Totalmobile release date deleted for ${questionnaireName} by ${this.username}`;
        if(this.previousReleaseDate.has(questionnaireName)) {
            successMessage = `Totalmobile release date deleted (previously ${dateFormatter(this.previousReleaseDate.get(questionnaireName)).format("YYYY-MM-DD")}) for ${questionnaireName} by ${this.username}`;
        }
        return this.performActionAndLog(
            () => this.instance.deleteReleaseDate(questionnaireName),
            successMessage,
            `Failed to remove TM release date for questionnaire ${questionnaireName}`
        );
    }

    async getReleaseDate(questionnaireName: string): Promise<tmReleaseDate | undefined> {
        const releaseDate = await this.instance.getReleaseDate(questionnaireName);
        if (releaseDate && releaseDate.tmreleasedate){
            this.previousReleaseDate.set(questionnaireName, releaseDate.tmreleasedate);
        }

        return releaseDate;
    }

    updateReleaseDate(questionnaireName: string, releaseDate: string): Promise<tmReleaseDate> {
        let successMessage = `Totalmobile release date updated to ${releaseDate} for ${questionnaireName} by ${this.username}`;
        if(this.previousReleaseDate.has(questionnaireName)){
            successMessage = `Totalmobile release date updated to ${releaseDate} (previously ${dateFormatter(this.previousReleaseDate.get(questionnaireName)).format("YYYY-MM-DD")}) for ${questionnaireName} by ${this.username}`;
        }

        return this.performActionAndLog(
            () => this.instance.updateReleaseDate(questionnaireName, releaseDate),
            successMessage,
            `Failed to set TM release date to ${releaseDate} for questionnaire ${questionnaireName}`
        );
    }

    private async performActionAndLog <Result> (action: () => Promise<Result>, successMessage: string, errorMessage: string): Promise<Result> {
        try {
            const result = await action();
            this.logger.info(successMessage);
            return result;
        } catch (error) {
            this.logger.error(errorMessage);
            throw error;
        }
    }
}
