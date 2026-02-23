import { TLinkedApiActionError } from '@linkedapi/node';

import { isStdoutTty } from '@utils/tty';
import { selectFields } from './field-selector';

interface TSuccessEnvelope {
  success: true;
  data: unknown;
}

interface TErrorEnvelope {
  success: false;
  error: {
    type: string;
    message: string;
  };
}

export function formatOutput({
  data,
  errors,
  isJson,
  fields,
  isQuiet,
}: {
  data?: unknown;
  errors: Array<TLinkedApiActionError>;
  isJson: boolean;
  fields?: string;
  isQuiet: boolean;
}): void {
  const hasActionError = errors.length > 0 && !data;

  if (hasActionError) {
    const actionError = errors[0]!;
    const envelope: TErrorEnvelope = {
      success: false,
      error: {
        type: actionError.type,
        message: actionError.message,
      },
    };

    if (isJson || !isStdoutTty()) {
      process.stdout.write(JSON.stringify(envelope, null, 2) + '\n');
    } else if (!isQuiet) {
      process.stdout.write(`Error: ${actionError.message} (${actionError.type})\n`);
    }

    return;
  }

  let outputData = data;

  if (fields && outputData !== undefined) {
    outputData = selectFields(outputData, fields);
  }

  const envelope: TSuccessEnvelope = {
    success: true,
    data: outputData ?? null,
  };

  if (isJson || !isStdoutTty()) {
    process.stdout.write(JSON.stringify(envelope, null, 2) + '\n');
  } else {
    formatHumanOutput(outputData);
  }
}

export function formatVoidOutput({
  errors,
  isJson,
  isQuiet,
  successMessage,
}: {
  errors: Array<TLinkedApiActionError>;
  isJson: boolean;
  isQuiet: boolean;
  successMessage: string;
}): void {
  const hasActionError = errors.length > 0;

  if (hasActionError) {
    const actionError = errors[0]!;
    const envelope: TErrorEnvelope = {
      success: false,
      error: {
        type: actionError.type,
        message: actionError.message,
      },
    };

    if (isJson || !isStdoutTty()) {
      process.stdout.write(JSON.stringify(envelope, null, 2) + '\n');
    } else if (!isQuiet) {
      process.stdout.write(`Error: ${actionError.message} (${actionError.type})\n`);
    }

    return;
  }

  const envelope: TSuccessEnvelope = {
    success: true,
    data: null,
  };

  if (isJson || !isStdoutTty()) {
    process.stdout.write(JSON.stringify(envelope, null, 2) + '\n');
  } else if (!isQuiet) {
    process.stdout.write(successMessage + '\n');
  }
}

function formatHumanOutput(data: unknown): void {
  if (data === undefined || data === null) {
    return;
  }

  if (Array.isArray(data)) {
    formatTable(data);
    return;
  }

  if (typeof data === 'object') {
    formatKeyValue(data as Record<string, unknown>);
    return;
  }

  process.stdout.write(String(data) + '\n');
}

function formatKeyValue(obj: Record<string, unknown>, indent: number = 0): void {
  const prefix = ' '.repeat(indent);

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      process.stdout.write(`${prefix}${key}:\n`);

      if (value.length === 0) {
        process.stdout.write(`${prefix}  (empty)\n`);
      } else if (typeof value[0] === 'object' && value[0] !== null) {
        for (const item of value) {
          process.stdout.write(`${prefix}  ---\n`);
          formatKeyValue(item as Record<string, unknown>, indent + 4);
        }
      } else {
        for (const item of value) {
          process.stdout.write(`${prefix}  - ${item}\n`);
        }
      }
    } else if (typeof value === 'object') {
      process.stdout.write(`${prefix}${key}:\n`);
      formatKeyValue(value as Record<string, unknown>, indent + 2);
    } else {
      process.stdout.write(`${prefix}${key}: ${value}\n`);
    }
  }
}

function formatTable(rows: Array<unknown>): void {
  if (rows.length === 0) {
    process.stdout.write('(no results)\n');
    return;
  }

  const firstRow = rows[0];

  if (typeof firstRow !== 'object' || firstRow === null) {
    for (const row of rows) {
      process.stdout.write(String(row) + '\n');
    }

    return;
  }

  const keys = Object.keys(firstRow);
  const widths: Record<string, number> = {};

  for (const key of keys) {
    widths[key] = key.length;
  }

  for (const row of rows) {
    const record = row as Record<string, unknown>;

    for (const key of keys) {
      const value = String(record[key] ?? '');
      const currentWidth = widths[key] ?? 0;
      widths[key] = Math.max(currentWidth, value.length);
    }
  }

  const header = keys.map((k) => k.padEnd(widths[k] ?? 0)).join('  ');
  const separator = keys.map((k) => '-'.repeat(widths[k] ?? 0)).join('  ');
  process.stdout.write(header + '\n');
  process.stdout.write(separator + '\n');

  for (const row of rows) {
    const record = row as Record<string, unknown>;
    const line = keys.map((k) => String(record[k] ?? '').padEnd(widths[k] ?? 0)).join('  ');
    process.stdout.write(line + '\n');
  }
}
