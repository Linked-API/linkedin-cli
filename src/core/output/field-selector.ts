export function selectFields(data: unknown, fields: string): unknown {
  const fieldList = fields.split(',').map((f) => f.trim());

  if (Array.isArray(data)) {
    return data.map((item) => pickFields(item, fieldList));
  }

  return pickFields(data, fieldList);
}

function pickFields(obj: unknown, fields: Array<string>): Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) {
    return {};
  }

  const record = obj as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const field of fields) {
    if (field in record) {
      result[field] = record[field];
    }
  }

  return result;
}
