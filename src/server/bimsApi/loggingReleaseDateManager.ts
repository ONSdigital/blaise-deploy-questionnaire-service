import {ReleaseDateManager} from "./releaseDateManager";
import {tmReleaseDate} from "./bimsApi";
import {Logger} from "./logger";

export default class LoggingReleaseDateManager implements ReleaseDateManager {
    constructor(private readonly instance: ReleaseDateManager, private readonly logger: Logger) {
    }

    async createReleaseDate(questionnaireName: string, releaseDate: string): Promise<tmReleaseDate> {
        try {
            let result = await this.instance.createReleaseDate(questionnaireName, releaseDate);
            this.logger.info(`Successfully set TM release date to ${releaseDate} for questionnaire ${questionnaireName}`);
            return result;
        } catch (error) {
            this.logger.error(`Failed to set TM release date to ${releaseDate} for questionnaire ${questionnaireName}`);
            throw error;
        }
    }

    async deleteReleaseDate(questionnaireName: string): Promise<void> {
        try {
            await this.instance.deleteReleaseDate(questionnaireName);
            this.logger.info(`Successfully removed TM release date for questionnaire ${questionnaireName}`);
        } catch (error) {
            this.logger.error(`Failed to remove TM release date for questionnaire ${questionnaireName}`);
            throw error;
        }
    }

    getReleaseDate(questionnaireName: string): Promise<tmReleaseDate | undefined> {
        return this.instance.getReleaseDate(questionnaireName);

    }

    async updateReleaseDate(questionnaireName: string, releaseDate: string): Promise<tmReleaseDate> {
        try {
            let result = await this.instance.updateReleaseDate(questionnaireName, releaseDate);
            this.logger.info(`Successfully set TM release date to ${releaseDate} for questionnaire ${questionnaireName}`);
            return result;
        } catch (error) {
            this.logger.error(`Failed to set TM release date to ${releaseDate} for questionnaire ${questionnaireName}`);
            throw error;
        }
    }
}
