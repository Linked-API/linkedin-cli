export const LINKEDIN_IDENTIFIER_PATTERN = {
  // An identifier is itself full of colons, so a `name:identifier` split cannot be positional: the
  // name ends where a value that announces itself as a URN or a URL begins.
  startSource: '(?:urn:li:|https?:\\/\\/)',
  memberUrn: /^urn:li:member:\d+$/,
  organizationUrn: /^urn:li:organization:\d+$/,
  personUrl: /^https?:\/\/[^/]*linkedin\.com\/in\//i,
  companyUrl: /^https?:\/\/[^/]*linkedin\.com\/company\//i,
  salesPersonUrl: /^https?:\/\/[^/]*linkedin\.com\/sales\/(?:lead|people)\//i,
  salesCompanyUrl: /^https?:\/\/[^/]*linkedin\.com\/sales\/company\//i,
} as const;
