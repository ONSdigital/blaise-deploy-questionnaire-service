function isNumber(n: string): boolean {
  const parsedValue = parseFloat(n);

  return !isNaN(parsedValue) && Number.isFinite(parsedValue);
}

function fieldPeriodFromQuestionnare(questionnaireName: string): string {
  const monthNumberString: string = questionnaireName.substring(5, 7);
  let month: string;

  const monthNames = [
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
  ];

  if (!isNumber(monthNumberString)) {
    throw new Error("Month was not a integer");
  }

  const monthNumberInt = parseInt(monthNumberString) - 1;

  if (monthNumberInt >= 0 && monthNumberInt < 12) {
    month = monthNames[monthNumberInt];
  } else {
    throw new Error("Month was dot between 1 and 12");
  }

  return month + " 20" + questionnaireName.substring(3, 5);
}

export function fieldPeriodToText(questionnaireName: string): string {
  try {
    return fieldPeriodFromQuestionnare(questionnaireName);
  } catch {
    console.error("Error getting field period");

    return "Field period unknown";
  }
}
