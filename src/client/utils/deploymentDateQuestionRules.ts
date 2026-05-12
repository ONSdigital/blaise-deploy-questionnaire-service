const toStartDateSurveyTLAs = ["DST", "LMS", "OPN", "TST"];

export const tmReleaseDateSurveyTLAs = ["DST", "LMS"];

export function shouldAskToStartDate(questionnaireName: string): boolean {
  return toStartDateSurveyTLAs.some((tla) => questionnaireName.startsWith(tla));
}

export function shouldAskTmReleaseDate(questionnaireName: string): boolean {
  return tmReleaseDateSurveyTLAs.some((tla) => questionnaireName.startsWith(tla));
}
