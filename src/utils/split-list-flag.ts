/**
 * Splits a list flag into its values: comma-separated, or a JSON array of strings when the flag
 * starts with `[`.
 *
 * The JSON form exists for values that contain a comma themselves – a "City, Region" location, an
 * industry such as "Technology, Information and Internet", a company such as "Example Co., Ltd." –
 * which a comma list would silently split into separate filters.
 */
export function splitListFlag(value: string): Array<string> {
  const trimmedValue = value.trim();

  if (!trimmedValue.startsWith('[')) {
    return value.split(',').map((element) => element.trim());
  }

  return parseJsonList(trimmedValue);
}

function parseJsonList(value: string): Array<string> {
  const parsedValue = parseJson(value);

  if (!Array.isArray(parsedValue) || !parsedValue.every((element) => typeof element === 'string')) {
    throw new Error(
      `Invalid list value: ${value}. Expected comma-separated values or a JSON array of strings, e.g. '["Chicago, Illinois","Denver"]'`,
    );
  }

  return parsedValue.map((element) => element.trim());
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}
