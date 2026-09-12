/**
 * Prisma error messages are multi-line and prefixed with a rendering of the
 * offending query. The useful part is the last line.
 */
export function lastLine(message: string): string {
  if (!message) {
    return '';
  }
  const lines = message
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length === 0 ? message : lines[lines.length - 1];
}
