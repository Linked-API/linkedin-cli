const MEMBER_URN_PATTERN = /^urn:li:member:\d+$/;
const ORGANIZATION_URN_PATTERN = /^urn:li:organization:\d+$/;
const PERSON_URL_PATTERN = /^https?:\/\/[^/]*linkedin\.com\/in\//i;
const COMPANY_URL_PATTERN = /^https?:\/\/[^/]*linkedin\.com\/company\//i;

// The identifier is optional and is itself full of colons, so the split cannot be positional: the
// name ends where a value that announces itself as a URN or a URL begins.
const MENTION_PATTERN = /^([^:]+):(.*?)(?::((?:urn:li:|https?:\/\/).*))?$/;

export interface TParsedPostMention {
  key: string;
  name: string;
  urn?: string;
  personHashedUrl?: string;
  companyHashedUrl?: string;
}

/**
 * Parses one `--mention` value: `key:name` or `key:name:identifier`.
 *
 * The identifier is optional, and which field it lands in is decided by its shape rather than by a
 * separate flag — a member or organization URN, or a hashed profile or company URL.
 */
export function parsePostMention(value: string): TParsedPostMention {
  const match = MENTION_PATTERN.exec(value);
  const key = match?.[1]?.trim();
  const name = match?.[2]?.trim();

  if (!key || !name) {
    throw new Error(`Invalid mention format: "${value}". Expected key:name[:identifier]`);
  }

  const mention: TParsedPostMention = { key, name };
  const identifier = match?.[3]?.trim();

  if (!identifier) {
    return mention;
  }

  if (MEMBER_URN_PATTERN.test(identifier) || ORGANIZATION_URN_PATTERN.test(identifier)) {
    mention.urn = identifier;
  } else if (PERSON_URL_PATTERN.test(identifier)) {
    mention.personHashedUrl = identifier;
  } else if (COMPANY_URL_PATTERN.test(identifier)) {
    mention.companyHashedUrl = identifier;
  } else {
    throw new Error(
      `Invalid mention identifier in "${value}". Expected urn:li:member:<id>, urn:li:organization:<id>, or a hashed LinkedIn profile or company URL`,
    );
  }

  return mention;
}
