export function parseContextFlag(rawContext: string): Record<string, unknown> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawContext);
  } catch {
    throw new Error('--context must be a valid JSON object');
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('--context must be a valid JSON object');
  }

  return parsed as Record<string, unknown>;
}
