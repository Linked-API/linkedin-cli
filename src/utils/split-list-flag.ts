import { Errors } from '@oclif/core';

import { EXIT_CODE } from '@core/errors/exit-codes';

/**
 * Splits a list flag into its values: comma-separated, or a JSON array of strings when the flag is
 * wrapped in `[` and `]`.
 *
 * The JSON form exists for values that contain a comma themselves – a "City, Region" location, an
 * industry such as "Technology, Information and Internet", a company such as "Example Co., Ltd." –
 * which a comma list would silently split into separate filters. Only a value both starting with
 * `[` and ending with `]` is read as JSON, so a literal such as "[24]7.ai" stays a plain value.
 */
export function splitListFlag(value: string): Array<string> {
  const trimmedValue = value.trim();

  if (!trimmedValue.startsWith('[') || !trimmedValue.endsWith(']')) {
    return value.split(',').map((element): string => element.trim());
  }

  return parseJsonList(trimmedValue);
}

function parseJsonList(value: string): Array<string> {
  const parsedValue = parseJson(value);

  if (
    !Array.isArray(parsedValue) ||
    !parsedValue.every((element): boolean => typeof element === 'string')
  ) {
    throw new Errors.CLIError(
      `Invalid list value: ${value}. Expected comma-separated values or a JSON array of strings, e.g. '["Chicago, Illinois","Denver"]'`,
      { exit: EXIT_CODE.VALIDATION },
    );
  }

  return parsedValue.map((element): string => element.trim());
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}
