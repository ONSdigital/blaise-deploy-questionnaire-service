import { type TmReleaseDate } from "./bimsApi.js";

export interface ReleaseDateManager {
  getReleaseDate(questionnaireName: string): Promise<TmReleaseDate | undefined>;
  deleteReleaseDate(questionnaireName: string): Promise<void>;
  createReleaseDate(questionnaireName: string, releaseDate: string): Promise<TmReleaseDate>;
  updateReleaseDate(questionnaireName: string, releaseDate: string): Promise<TmReleaseDate>;
}
