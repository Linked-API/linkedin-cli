import { LINKEDIN_IDENTIFIER_PATTERN } from './linkedin-identifier-pattern';

const {
  startSource,
  memberUrn,
  organizationUrn,
  personUrl,
  companyUrl,
  salesPersonUrl,
  salesCompanyUrl,
} = LINKEDIN_IDENTIFIER_PATTERN;
const ACTOR_FILTER_ELEMENT_PATTERN = new RegExp(`^(.*?)(?::(${startSource}.*))?$`);

const IDENTIFIER_PATTERNS_BY_KIND = {
  member: [memberUrn, personUrl, salesPersonUrl],
  company: [organizationUrn, companyUrl, salesCompanyUrl],
} as const;

const EXPECTED_IDENTIFIER_BY_KIND = {
  member: 'urn:li:member:<id> or a LinkedIn profile URL',
  company: 'urn:li:organization:<id> or a LinkedIn company URL',
} as const;

type TActorKind = keyof typeof IDENTIFIER_PATTERNS_BY_KIND;

interface TActorFilterWithId {
  name: string;
  id: string;
}

type TActorFilterEntry = string | TActorFilterWithId;

/**
 * Parses a comma-separated `post search` actor flag, where each element is `name` or
 * `name:identifier`.
 *
 * An element without an identifier stays the plain string it always was, so existing calls send
 * exactly what they sent before. An identifier must name the flag's kind of entity: a person for
 * the member flags, a company for the company flags.
 */
export function parsePostSearchActorFilter({
  value,
  actorKind,
}: {
  value: string;
  actorKind: TActorKind;
}): Array<TActorFilterEntry> {
  return value.split(',').map((element) => parseElement({ element: element.trim(), actorKind }));
}

function parseElement({
  element,
  actorKind,
}: {
  element: string;
  actorKind: TActorKind;
}): TActorFilterEntry {
  const match = ACTOR_FILTER_ELEMENT_PATTERN.exec(element);
  const identifier = match?.[2]?.trim();

  if (!identifier) {
    return element;
  }

  const name = match?.[1]?.trim();

  if (!name) {
    throw new Error(`Invalid filter value: "${element}". Expected name[:identifier]`);
  }

  const isExpectedKind = IDENTIFIER_PATTERNS_BY_KIND[actorKind].some((pattern) =>
    pattern.test(identifier),
  );

  if (!isExpectedKind) {
    throw new Error(
      `Invalid filter identifier in "${element}". Expected ${EXPECTED_IDENTIFIER_BY_KIND[actorKind]}`,
    );
  }

  return { name, id: identifier };
}
