export enum QuestionnaireMode {
  Cati,
  Mixed
}

export function GetQuestionnaireMode(modes: string[]): QuestionnaireMode {
  if (modes.length === 1 && modes[0] === "CATI") {
    return QuestionnaireMode.Cati;
  }
  return QuestionnaireMode.Mixed;
}
