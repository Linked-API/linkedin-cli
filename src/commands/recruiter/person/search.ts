import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { RC_FILTER_OPTIONS } from '@linkedapi/node';
import { Flags } from '@oclif/core';
import { buildRcSearchParams } from '@utils/build-rc-search-params';

export default class RecruiterPersonSearch extends BaseCommand {
  static override readonly description =
    "Search People. Requires a LinkedIn Recruiter Lite seat and Linked API's Plus plan. Provide term, a nonempty filter, or customSearchUrl. customSearchUrl cannot be combined with term or filter. Filters alone are accepted. Scope fields and false booleans alone are not search criteria.";
  static override readonly args = {};
  static override readonly flags = {
    ...BaseCommand.baseFlags,
    term: Flags.string({ description: 'Search keywords; filters alone are also accepted' }),
    url: Flags.string({ description: 'Recruiter search URL; exclusive with term or filters' }),
    limit: Flags.integer({ min: 1, max: 1000, default: 25 }),
    'job-titles': Flags.string({
      description: 'Comma-separated values, or a JSON array of strings if a value contains a comma',
    }),
    'job-titles-scope': Flags.string({
      options: ['currentOrPast', 'current', 'pastNotCurrent', 'past'],
      description: 'Scope for jobTitles',
    }),
    locations: Flags.string({
      description: 'Comma-separated values, or a JSON array of strings if a value contains a comma',
    }),
    'locations-scope': Flags.string({
      options: ['current', 'currentOrOpenToRelocate', 'openToRelocateOnly'],
      description: 'Scope for locations',
    }),
    'postal-code': Flags.string({ description: 'Postal or ZIP code' }),
    'postal-code-radius-miles': Flags.integer({
      options: ['1', '5', '10', '25', '50', '100', '200'],
      description: 'Radius in miles; requires --postal-code',
    }),
    skills: Flags.string({
      description: 'Comma-separated values, or a JSON array of strings if a value contains a comma',
    }),
    'has-passed-skill-assessment': Flags.boolean({
      allowNo: true,
      description: 'Set the checkbox on or off; false is not an inverse filter',
    }),
    companies: Flags.string({
      description: 'Comma-separated values, or a JSON array of strings if a value contains a comma',
    }),
    'companies-scope': Flags.string({
      options: ['currentOrPast', 'current', 'pastNotCurrent', 'past'],
      description: 'Scope for companies',
    }),
    'current-companies': Flags.string({
      description: 'Comma-separated values, or a JSON array of strings if a value contains a comma',
    }),
    'past-companies': Flags.string({
      description: 'Comma-separated values, or a JSON array of strings if a value contains a comma',
    }),
    'company-sizes': Flags.string({
      description:
        'Comma-separated or a JSON array; values: selfEmployed, 1-10, 11-50, 51-200, 201-500, 501-1000, 1001-5000, 5001-10000, 10001+',
    }),
    schools: Flags.string({
      description: 'Comma-separated values, or a JSON array of strings if a value contains a comma',
    }),
    'graduation-years-from': Flags.integer({
      min: 1900,
      max: 2100,
      description: 'Graduation Years from; at least one bound, from must not exceed to',
    }),
    'graduation-years-to': Flags.integer({
      min: 1900,
      max: 2100,
      description: 'Graduation Years to; at least one bound, from must not exceed to',
    }),
    industries: Flags.string({
      description: 'Comma-separated values, or a JSON array of strings if a value contains a comma',
    }),
    'job-functions': Flags.string({
      description:
        'Comma-separated or a JSON array; values: Accounting, Administrative, Arts and Design, Business Development, Community and Social Services, Consulting, Customer Success and Support, Education, Engineering, Entrepreneurship, Finance, Healthcare Services, Human Resources, Information Technology, Legal, Marketing, Media and Communication, Military and Protective Services, Operations, Product Management, Program and Project Management, Purchasing, Quality Assurance, Real Estate, Research, Sales',
    }),
    seniority: Flags.string({
      description:
        'Comma-separated or a JSON array; values: unpaid, training, entry, senior, manager, director, vp, cxo, partner, owner',
    }),
    'years-of-experience-from': Flags.integer({
      min: 0,
      max: 30,
      description: 'Years Of Experience from; at least one bound, from must not exceed to',
    }),
    'years-of-experience-to': Flags.integer({
      min: 0,
      max: 30,
      description: 'Years Of Experience to; at least one bound, from must not exceed to',
    }),
    'first-names': Flags.string({
      description: 'Comma-separated values, or a JSON array of strings if a value contains a comma',
    }),
    'last-names': Flags.string({
      description: 'Comma-separated values, or a JSON array of strings if a value contains a comma',
    }),
    'profile-languages': Flags.string({
      description:
        'Comma-separated values, or a JSON array of strings if a value contains a comma; LinkedIn codes: en, es, in (Indonesian), _o (Other), not language names',
    }),
    'recently-joined': Flags.string({
      description:
        'Comma-separated or a JSON array; values: 1day, 2to7days, 8to14days, 15to30days, 1to3months',
    }),
    'network-relationships': Flags.string({
      description: 'Comma-separated or a JSON array; values: 1st, 2nd, groupMembers, 3rd+',
    }),
    'is-military-veteran': Flags.boolean({
      allowNo: true,
      description: 'Set the checkbox on or off; false is not an inverse filter',
    }),
    groups: Flags.string({
      description: 'Comma-separated values, or a JSON array of strings if a value contains a comma',
    }),
    'recruiting-activity-type': Flags.string({
      options: [...RC_FILTER_OPTIONS.recruitingActivityType],
      description: 'Activity type',
    }),
    'recruiting-activity-period': Flags.string({
      options: [...RC_FILTER_OPTIONS.recruitingActivityPeriod],
      description: 'Activity period; requires activity type',
    }),
    projects: Flags.string({
      description:
        'Comma-separated values, or a JSON array of strings if a value contains a comma; project names, not IDs',
    }),
    notes: Flags.string({
      description: 'Comma-separated values, or a JSON array of strings if a value contains a comma',
    }),
    'hide-previously-viewed': Flags.boolean({
      allowNo: true,
      description: 'Set the checkbox on or off; false is not an inverse filter',
    }),
  };
  public async run(): Promise<void> {
    const { flags } = await this.parse(RecruiterPersonSearch);
    const params = buildRcSearchParams(flags);
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runWorkflow(client.rcSearchPeople, params, { isQuiet: flags.quiet });
      formatOutput({
        data: result.data,
        errors: result.errors,
        isJson: flags.json,
        fields: flags.fields,
        isQuiet: flags.quiet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
