const toStartDateSurveyTlas = ["DST", "LMS", "OPN"];

export const tmReleaseDateSurveyTlas = ["DST", "LMS"];

export function shouldAskToStartDate(questionnaireName: string): boolean {
  return toStartDateSurveyTlas.some((tla) => questionnaireName.startsWith(tla));
}

export function shouldAskTmReleaseDate(questionnaireName: string): boolean {
  return tmReleaseDateSurveyTlas.some((tla) => questionnaireName.startsWith(tla));
}
