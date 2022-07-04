import { tmReleaseDate } from "./bimsApi";

export interface ReleaseDateManager {
    getReleaseDate(questionnaireName: string): Promise<tmReleaseDate | undefined>;
    deleteReleaseDate(questionnaireName: string): Promise<void>;
    createReleaseDate(questionnaireName: string, releaseDate: string): Promise<tmReleaseDate>;
    updateReleaseDate(questionnaireName: string, releaseDate: string): Promise<tmReleaseDate>;
}
