const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function isNumber(n: string): boolean {
  const parsedValue = parseFloat(n);

  return !isNaN(parsedValue) && Number.isFinite(parsedValue);
}

function fieldPeriodFromQuestionnaire(questionnaireName: string): string {
  const monthNumberString: string = questionnaireName.substring(5, 7);

  if (!isNumber(monthNumberString)) {
    throw new Error("Month was not an integer");
  }

  const monthNumberInt = parseInt(monthNumberString) - 1;

  if (monthNumberInt < 0 || monthNumberInt >= 12) {
    throw new Error("Month was not between 1 and 12");
  }

  const month = MONTH_NAMES[monthNumberInt];

  return month + " 20" + questionnaireName.substring(3, 5);
}

export function fieldPeriodToText(questionnaireName: string): string {
  try {
    return fieldPeriodFromQuestionnaire(questionnaireName);
  } catch {
    return "Unknown";
  }
}
