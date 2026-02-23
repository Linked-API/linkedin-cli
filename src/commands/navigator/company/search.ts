import { Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';

export default class NavigatorCompanySearch extends BaseCommand {
  static override description = 'Search for companies via Sales Navigator';

  static override flags = {
    ...BaseCommand.baseFlags,
    term: Flags.string({
      description: 'Search keyword or phrase',
    }),
    limit: Flags.integer({
      description: 'Max results to return',
    }),
    sizes: Flags.string({
      description: 'Filter by company sizes (comma-separated)',
    }),
    locations: Flags.string({
      description: 'Filter by locations (comma-separated)',
    }),
    industries: Flags.string({
      description: 'Filter by industries (comma-separated)',
    }),
    'revenue-min': Flags.string({
      description: 'Minimum annual revenue in million USD (0, 0.5, 1, 2.5, 5, 10, 20, 50, 100, 500, 1000)',
    }),
    'revenue-max': Flags.string({
      description: 'Maximum annual revenue in million USD (0.5, 1, 2.5, 5, 10, 20, 50, 100, 500, 1000, 1000+)',
    }),
  };

  static override examples = [
    '<%= config.bin %> navigator company search --term "fintech" --sizes "11-50,51-200" --revenue-min 1 --revenue-max 50',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(NavigatorCompanySearch);

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {};
    if (flags.term) params.term = flags.term;
    if (flags.limit) params.limit = flags.limit;

    const filter: Record<string, unknown> = {};
    if (flags.sizes) filter.sizes = flags.sizes.split(',').map((s) => s.trim());
    if (flags.locations) filter.locations = flags.locations.split(',').map((s) => s.trim());
    if (flags.industries) filter.industries = flags.industries.split(',').map((s) => s.trim());
    if (flags['revenue-min'] || flags['revenue-max']) {
      const revenue: Record<string, string> = {};
      if (flags['revenue-min']) revenue.min = flags['revenue-min'];
      if (flags['revenue-max']) revenue.max = flags['revenue-max'];
      filter.annualRevenue = revenue;
    }

    if (Object.keys(filter).length > 0) {
      params.filter = filter;
    }

    try {
      const result = await runWorkflow(client.nvSearchCompanies, params, {
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
