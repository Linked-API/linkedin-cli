import { EXIT_CODE } from '@core/errors/exit-codes';
import { RC_FILTER_OPTIONS } from '@linkedapi/node';
import { Errors } from '@oclif/core';
import { splitListFlag } from '@utils/split-list-flag';

export function buildRcSearchParams(flags: Record<string, unknown>): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (typeof flags['job-titles'] === 'string') {
    const values = splitListFlag(flags['job-titles'] as string).filter(Boolean);
    if (values.length) filter.jobTitles = values;
  }
  if (typeof flags['locations'] === 'string') {
    const values = splitListFlag(flags['locations'] as string).filter(Boolean);
    if (values.length) filter.locations = values;
  }
  if (typeof flags['skills'] === 'string') {
    const values = splitListFlag(flags['skills'] as string).filter(Boolean);
    if (values.length) filter.skills = values;
  }
  if (typeof flags['companies'] === 'string') {
    const values = splitListFlag(flags['companies'] as string).filter(Boolean);
    if (values.length) filter.companies = values;
  }
  if (typeof flags['current-companies'] === 'string') {
    const values = splitListFlag(flags['current-companies'] as string).filter(Boolean);
    if (values.length) filter.currentCompanies = values;
  }
  if (typeof flags['past-companies'] === 'string') {
    const values = splitListFlag(flags['past-companies'] as string).filter(Boolean);
    if (values.length) filter.pastCompanies = values;
  }
  if (typeof flags['schools'] === 'string') {
    const values = splitListFlag(flags['schools'] as string).filter(Boolean);
    if (values.length) filter.schools = values;
  }
  if (typeof flags['industries'] === 'string') {
    const values = splitListFlag(flags['industries'] as string).filter(Boolean);
    if (values.length) filter.industries = values;
  }
  if (typeof flags['first-names'] === 'string') {
    const values = splitListFlag(flags['first-names'] as string).filter(Boolean);
    if (values.length) filter.firstNames = values;
  }
  if (typeof flags['last-names'] === 'string') {
    const values = splitListFlag(flags['last-names'] as string).filter(Boolean);
    if (values.length) filter.lastNames = values;
  }
  if (typeof flags['profile-languages'] === 'string') {
    const values = splitListFlag(flags['profile-languages'] as string).filter(Boolean);
    if (values.length) filter.profileLanguages = values;
  }
  if (typeof flags['groups'] === 'string') {
    const values = splitListFlag(flags['groups'] as string).filter(Boolean);
    if (values.length) filter.groups = values;
  }
  if (typeof flags['projects'] === 'string') {
    const values = splitListFlag(flags['projects'] as string).filter(Boolean);
    if (values.length) filter.projects = values;
  }
  if (typeof flags['notes'] === 'string') {
    const values = splitListFlag(flags['notes'] as string).filter(Boolean);
    if (values.length) filter.notes = values;
  }
  if (typeof flags['company-sizes'] === 'string') {
    const values = splitListFlag(flags['company-sizes'] as string).filter(Boolean);
    if (
      values.some(
        (value): boolean =>
          !(RC_FILTER_OPTIONS.companySizes as ReadonlyArray<string>).includes(value),
      )
    )
      fail('Invalid companySizes value');
    if (values.length) filter.companySizes = values;
  }
  if (typeof flags['job-functions'] === 'string') {
    const values = splitListFlag(flags['job-functions'] as string).filter(Boolean);
    if (
      values.some(
        (value): boolean =>
          !(RC_FILTER_OPTIONS.jobFunctions as ReadonlyArray<string>).includes(value),
      )
    )
      fail('Invalid jobFunctions value');
    if (values.length) filter.jobFunctions = values;
  }
  if (typeof flags['seniority'] === 'string') {
    const values = splitListFlag(flags['seniority'] as string).filter(Boolean);
    if (
      values.some(
        (value): boolean => !(RC_FILTER_OPTIONS.seniority as ReadonlyArray<string>).includes(value),
      )
    )
      fail('Invalid seniority value');
    if (values.length) filter.seniority = values;
  }
  if (typeof flags['recently-joined'] === 'string') {
    const values = splitListFlag(flags['recently-joined'] as string).filter(Boolean);
    if (
      values.some(
        (value): boolean =>
          !(RC_FILTER_OPTIONS.recentlyJoined as ReadonlyArray<string>).includes(value),
      )
    )
      fail('Invalid recentlyJoined value');
    if (values.length) filter.recentlyJoined = values;
  }
  if (typeof flags['network-relationships'] === 'string') {
    const values = splitListFlag(flags['network-relationships'] as string).filter(Boolean);
    if (
      values.some(
        (value): boolean =>
          !(RC_FILTER_OPTIONS.networkRelationships as ReadonlyArray<string>).includes(value),
      )
    )
      fail('Invalid networkRelationships value');
    if (values.length) filter.networkRelationships = values;
  }
  if (flags['job-titles-scope'] !== undefined) filter.jobTitlesScope = flags['job-titles-scope'];
  if (flags['companies-scope'] !== undefined) filter.companiesScope = flags['companies-scope'];
  if (flags['locations-scope'] !== undefined) filter.locationsScope = flags['locations-scope'];
  if (flags['has-passed-skill-assessment'] !== undefined)
    filter.hasPassedSkillAssessment = flags['has-passed-skill-assessment'];
  if (flags['is-military-veteran'] !== undefined)
    filter.isMilitaryVeteran = flags['is-military-veteran'];
  if (flags['hide-previously-viewed'] !== undefined)
    filter.hidePreviouslyViewed = flags['hide-previously-viewed'];
  {
    const from = flags['graduation-years-from'];
    const to = flags['graduation-years-to'];
    if (typeof from === 'number' && typeof to === 'number' && from > to)
      fail('graduationYears: from must not exceed to');
    if (from !== undefined || to !== undefined)
      filter.graduationYears = {
        ...(from === undefined ? {} : { from }),
        ...(to === undefined ? {} : { to }),
      };
  }
  {
    const from = flags['years-of-experience-from'];
    const to = flags['years-of-experience-to'];
    if (typeof from === 'number' && typeof to === 'number' && from > to)
      fail('yearsOfExperience: from must not exceed to');
    if (from !== undefined || to !== undefined)
      filter.yearsOfExperience = {
        ...(from === undefined ? {} : { from }),
        ...(to === undefined ? {} : { to }),
      };
  }
  const code = flags['postal-code'];
  const radiusMiles = flags['postal-code-radius-miles'];
  if (radiusMiles !== undefined && !code) fail('--postal-code-radius-miles requires --postal-code');
  if (code) filter.postalCode = { code, ...(radiusMiles === undefined ? {} : { radiusMiles }) };
  const type = flags['recruiting-activity-type'];
  const period = flags['recruiting-activity-period'];
  if (period && !type) fail('--recruiting-activity-period requires --recruiting-activity-type');
  if (type) filter.recruitingActivity = { type, ...(period ? { period } : {}) };
  if (flags.url !== undefined) {
    const hasFilterFlag = [
      'job-titles',
      'job-titles-scope',
      'locations',
      'locations-scope',
      'postal-code',
      'postal-code-radius-miles',
      'skills',
      'has-passed-skill-assessment',
      'companies',
      'companies-scope',
      'current-companies',
      'past-companies',
      'company-sizes',
      'schools',
      'graduation-years-from',
      'graduation-years-to',
      'industries',
      'job-functions',
      'seniority',
      'years-of-experience-from',
      'years-of-experience-to',
      'first-names',
      'last-names',
      'profile-languages',
      'recently-joined',
      'network-relationships',
      'is-military-veteran',
      'groups',
      'recruiting-activity-type',
      'recruiting-activity-period',
      'projects',
      'notes',
      'hide-previously-viewed',
    ].some((key): boolean => flags[key] !== undefined);
    if (flags.term !== undefined || hasFilterFlag)
      fail('--url cannot be combined with --term or filter flags');
    return { customSearchUrl: flags.url, limit: flags.limit };
  }
  const term = typeof flags.term === 'string' && flags.term.trim() ? flags.term : undefined;
  if (
    !term &&
    !Object.entries(filter).some(
      ([key, value]): boolean => !key.endsWith('Scope') && value !== false,
    )
  )
    fail('Provide --term, --url, or an effective filter');
  return {
    ...(term ? { term } : {}),
    ...(Object.keys(filter).length ? { filter } : {}),
    limit: flags.limit,
  };
}
function fail(message: string): never {
  throw new Errors.CLIError(message, { exit: EXIT_CODE.VALIDATION });
}
