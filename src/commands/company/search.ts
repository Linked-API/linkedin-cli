import { Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';

export default class CompanySearch extends BaseCommand {
  static override description = 'Search for companies on LinkedIn';

  static override flags = {
    ...BaseCommand.baseFlags,
    term: Flags.string({
      description: 'Search keyword or phrase',
    }),
    limit: Flags.integer({
      description: 'Max results to return',
    }),
    sizes: Flags.string({
      description: 'Filter by company sizes (comma-separated, e.g. "1-10,11-50,51-200")',
    }),
    locations: Flags.string({
      description: 'Filter by locations (comma-separated)',
    }),
    industries: Flags.string({
      description: 'Filter by industries (comma-separated)',
    }),
  };

  static override examples = [
    '<%= config.bin %> company search --term "fintech" --sizes "11-50,51-200"',
    '<%= config.bin %> company search --industries "Software Development" --json',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(CompanySearch);

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {};
    if (flags.term) params.term = flags.term;
    if (flags.limit) params.limit = flags.limit;

    const filter: Record<string, unknown> = {};
    if (flags.sizes) filter.sizes = flags.sizes.split(',').map((s) => s.trim());
    if (flags.locations) filter.locations = flags.locations.split(',').map((s) => s.trim());
    if (flags.industries) filter.industries = flags.industries.split(',').map((s) => s.trim());

    if (Object.keys(filter).length > 0) {
      params.filter = filter;
    }

    try {
      const result = await runWorkflow(client.searchCompanies, params, {
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
