import {ReleaseDateManager} from "./releaseDateManager";
import {tmReleaseDate} from "./bimsApi";
import {Logger} from "./logger";
import dateFormatter from "dayjs";


export default class LoggingReleaseDateManager implements ReleaseDateManager {
    private previousReleaseDate: Map<string, string> = new Map();

    constructor(private readonly instance: ReleaseDateManager, private readonly logger: Logger) {
    }

    createReleaseDate(questionnaireName: string, releaseDate: string): Promise<tmReleaseDate> {
        return this.performActionAndLog(
            () => this.instance.createReleaseDate(questionnaireName, releaseDate),
            `Totalmobile release date set to ${releaseDate} for ${questionnaireName}`,
            `Failed to set TM release date to ${releaseDate} for questionnaire ${questionnaireName}`,
            questionnaireName
        );
    }

    deleteReleaseDate(questionnaireName: string): Promise<void> {
        return this.performActionAndLog(
            () => this.instance.deleteReleaseDate(questionnaireName),
            `Totalmobile release date deleted for ${questionnaireName}`,
            `Failed to remove TM release date for questionnaire ${questionnaireName}`,
            questionnaireName
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
        return this.performActionAndLog(
            () => this.instance.updateReleaseDate(questionnaireName, releaseDate),
            `Totalmobile release date updated to ${releaseDate} for ${questionnaireName}`,
            `Failed to set TM release date to ${releaseDate} for questionnaire ${questionnaireName}`,
            questionnaireName
        );
    }

    private async performActionAndLog <Result> (action: () => Promise<Result>, successMessage: string, errorMessage: string, questionnaireName: string): Promise<Result> {
        try {
            const result = await action();
            let message = successMessage;

            if(this.previousReleaseDate.has(questionnaireName)){
                message += `. Previously ${dateFormatter(this.previousReleaseDate.get(questionnaireName)).format("YYYY-MM-DD")}`;
            }
            this.logger.info(message);
            return result;

        } catch (error) {
            this.logger.error(errorMessage);
            throw error;
        }
    }
}
