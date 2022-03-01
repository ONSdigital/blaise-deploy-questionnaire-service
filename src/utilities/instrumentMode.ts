export enum InstrumentMode {
  Cati,
  Mixed
}

export function GetInstrumentMode(modes: string[]): InstrumentMode {
  if (modes.length === 1 && modes[0] === "CATI") {
    return InstrumentMode.Cati;
  }
  return InstrumentMode.Mixed;
}
