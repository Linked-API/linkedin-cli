import { LINKEDIN_IDENTIFIER_PATTERN } from './linkedin-identifier-pattern';

const { memberUrn, organizationUrn, personUrl, companyUrl, startSource } =
  LINKEDIN_IDENTIFIER_PATTERN;
const MENTION_PATTERN = new RegExp(`^([^:]+):(.*?)(?::(${startSource}.*))?$`);

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

  if (memberUrn.test(identifier) || organizationUrn.test(identifier)) {
    mention.urn = identifier;
  } else if (personUrl.test(identifier)) {
    mention.personHashedUrl = identifier;
  } else if (companyUrl.test(identifier)) {
    mention.companyHashedUrl = identifier;
  } else {
    throw new Error(
      `Invalid mention identifier in "${value}". Expected urn:li:member:<id>, urn:li:organization:<id>, or a hashed LinkedIn profile or company URL`,
    );
  }

  return mention;
}
