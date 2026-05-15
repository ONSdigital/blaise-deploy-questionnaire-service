export function sanitise(value: string): string {
  return value.replace(/[\r\n\t\0]/g, "");
}
