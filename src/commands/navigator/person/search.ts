import { Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { EXIT_CODE } from '@core/errors/exit-codes';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { splitListFlag } from '@utils/split-list-flag';

export default class NavigatorPersonSearch extends BaseCommand {
  static override description = 'Search for people via Sales Navigator';

  static override flags = {
    ...BaseCommand.baseFlags,
    term: Flags.string({
      description: 'Search keyword or phrase (required unless --url is given)',
    }),
    url: Flags.string({
      description:
        'Sales Navigator people search URL (linkedin.com/sales/search/people/...). Overrides --term and the filters',
    }),
    limit: Flags.integer({
      description: 'Max results to return',
    }),
    'first-name': Flags.string({
      description: 'Filter by first name',
    }),
    'last-name': Flags.string({
      description: 'Filter by last name',
    }),
    position: Flags.string({
      description: 'Filter by job position',
    }),
    locations: Flags.string({
      description:
        'Filter by locations (comma-separated, or a JSON array if a value contains a comma)',
    }),
    industries: Flags.string({
      description:
        'Filter by industries (comma-separated, or a JSON array if a value contains a comma)',
    }),
    'current-companies': Flags.string({
      description:
        'Filter by current companies (comma-separated, or a JSON array if a value contains a comma)',
    }),
    'previous-companies': Flags.string({
      description:
        'Filter by previous companies (comma-separated, or a JSON array if a value contains a comma)',
    }),
    schools: Flags.string({
      description:
        'Filter by schools (comma-separated, or a JSON array if a value contains a comma)',
    }),
    'years-of-experience': Flags.string({
      description: 'Filter by experience ranges (comma-separated: lessThanOne,oneToTwo,threeToFive,sixToTen,moreThanTen)',
    }),
    'connection-degrees': Flags.string({
      description: 'Filter by your connection degree (comma-separated: 1st,2nd,3rd+,groupMembers)',
    }),
  };

  static override examples = [
    '<%= config.bin %> navigator person search --term "VP Marketing" --locations "United States"',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(NavigatorPersonSearch);

    if (!flags.term && !flags.url) {
      this.error('Either --term or --url is required; filters alone are not accepted.', {
        exit: EXIT_CODE.VALIDATION,
      });
    }

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {};
    if (flags.term) params.term = flags.term;
    if (flags.url) params.customSearchUrl = flags.url;
    if (flags.limit) params.limit = flags.limit;

    const filter: Record<string, unknown> = {};
    if (flags['first-name']) filter.firstName = flags['first-name'];
    if (flags['last-name']) filter.lastName = flags['last-name'];
    if (flags.position) filter.position = flags.position;
    if (flags.locations) filter.locations = splitListFlag(flags.locations);
    if (flags.industries) filter.industries = splitListFlag(flags.industries);
    if (flags['current-companies'])
      filter.currentCompanies = splitListFlag(flags['current-companies']);
    if (flags['previous-companies'])
      filter.previousCompanies = splitListFlag(flags['previous-companies']);
    if (flags.schools) filter.schools = splitListFlag(flags.schools);
    if (flags['years-of-experience'])
      filter.yearsOfExperiences = splitListFlag(flags['years-of-experience']);
    if (flags['connection-degrees'])
      filter.connectionDegrees = splitListFlag(flags['connection-degrees']);

    if (Object.keys(filter).length > 0) {
      params.filter = filter;
    }

    try {
      const result = await runWorkflow(client.nvSearchPeople, params, {
        isQuiet: flags.quiet,
      });

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
