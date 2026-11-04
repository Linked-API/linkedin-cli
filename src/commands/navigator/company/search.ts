import { Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { EXIT_CODE } from '@core/errors/exit-codes';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { splitListFlag } from '@utils/split-list-flag';

export default class NavigatorCompanySearch extends BaseCommand {
  static override description = 'Search for companies via Sales Navigator';

  static override flags = {
    ...BaseCommand.baseFlags,
    term: Flags.string({
      description: 'Search keyword or phrase (required unless --url is given)',
    }),
    url: Flags.string({
      description:
        'Sales Navigator companies search URL (linkedin.com/sales/search/company/...). Overrides --term and the filters',
    }),
    limit: Flags.integer({
      description: 'Max results to return',
    }),
    sizes: Flags.string({
      description: 'Filter by company sizes (comma-separated)',
    }),
    locations: Flags.string({
      description:
        'Filter by locations (comma-separated, or a JSON array if a value contains a comma)',
    }),
    industries: Flags.string({
      description:
        'Filter by industries (comma-separated, or a JSON array if a value contains a comma)',
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
    if (flags.sizes) filter.sizes = splitListFlag(flags.sizes);
    if (flags.locations) filter.locations = splitListFlag(flags.locations);
    if (flags.industries) filter.industries = splitListFlag(flags.industries);
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
