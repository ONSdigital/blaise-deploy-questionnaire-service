const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

type RelativeUnit = Intl.RelativeTimeFormatUnit;

const units: Array<{ unit: RelativeUnit; milliseconds: number }> = [
  { unit: "year", milliseconds: 1000 * 60 * 60 * 24 * 365 },
  { unit: "month", milliseconds: 1000 * 60 * 60 * 24 * 30 },
  { unit: "week", milliseconds: 1000 * 60 * 60 * 24 * 7 },
  { unit: "day", milliseconds: 1000 * 60 * 60 * 24 },
  { unit: "hour", milliseconds: 1000 * 60 * 60 },
  { unit: "minute", milliseconds: 1000 * 60 },
  { unit: "second", milliseconds: 1000 },
];

export function formatRelativeDate(dateValue: Date | string): string {
  const parsedDate = dateValue instanceof Date ? dateValue : new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(dateValue);
  }

  const differenceInMilliseconds = parsedDate.getTime() - Date.now();
  const selectedUnitIndex = units.findIndex(({ milliseconds }) => {
    return Math.abs(differenceInMilliseconds) >= milliseconds;
  });
  const selectedUnit =
    selectedUnitIndex === -1 ? units[units.length - 1]! : units[selectedUnitIndex]!;

  return relativeTimeFormatter.format(
    Math.round(differenceInMilliseconds / selectedUnit.milliseconds),
    selectedUnit.unit,
  );
}
