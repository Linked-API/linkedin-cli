import { Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';

export default class NavigatorPersonSearch extends BaseCommand {
  static override description = 'Search for people via Sales Navigator';

  static override flags = {
    ...BaseCommand.baseFlags,
    term: Flags.string({
      description: 'Search keyword or phrase',
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
      description: 'Filter by locations (comma-separated)',
    }),
    industries: Flags.string({
      description: 'Filter by industries (comma-separated)',
    }),
    'current-companies': Flags.string({
      description: 'Filter by current companies (comma-separated)',
    }),
    'previous-companies': Flags.string({
      description: 'Filter by previous companies (comma-separated)',
    }),
    schools: Flags.string({
      description: 'Filter by schools (comma-separated)',
    }),
    'years-of-experience': Flags.string({
      description: 'Filter by experience ranges (comma-separated: lessThanOne,oneToTwo,threeToFive,sixToTen,moreThanTen)',
    }),
  };

  static override examples = [
    '<%= config.bin %> navigator person search --term "VP Marketing" --locations "United States"',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(NavigatorPersonSearch);

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {};
    if (flags.term) params.term = flags.term;
    if (flags.limit) params.limit = flags.limit;

    const filter: Record<string, unknown> = {};
    if (flags['first-name']) filter.firstName = flags['first-name'];
    if (flags['last-name']) filter.lastName = flags['last-name'];
    if (flags.position) filter.position = flags.position;
    if (flags.locations) filter.locations = splitCsv(flags.locations);
    if (flags.industries) filter.industries = splitCsv(flags.industries);
    if (flags['current-companies']) filter.currentCompanies = splitCsv(flags['current-companies']);
    if (flags['previous-companies'])
      filter.previousCompanies = splitCsv(flags['previous-companies']);
    if (flags.schools) filter.schools = splitCsv(flags.schools);
    if (flags['years-of-experience'])
      filter.yearsOfExperience = splitCsv(flags['years-of-experience']);

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

function splitCsv(value: string): Array<string> {
  return value.split(',').map((s) => s.trim());
}
