import { Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { EXIT_CODE } from '@core/errors/exit-codes';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { splitListFlag } from '@utils/split-list-flag';

export default class CompanySearch extends BaseCommand {
  static override description = 'Search for companies on LinkedIn';

  static override flags = {
    ...BaseCommand.baseFlags,
    term: Flags.string({
      description: 'Search keyword or phrase (required unless --url is given)',
    }),
    url: Flags.string({
      description:
        'LinkedIn companies search URL (linkedin.com/search/results/companies/...). Overrides --term and the filters',
    }),
    limit: Flags.integer({
      description: 'Max results to return',
    }),
    sizes: Flags.string({
      description: 'Filter by company sizes (comma-separated, e.g. "1-10,11-50,51-200")',
    }),
    locations: Flags.string({
      description:
        'Filter by locations (comma-separated, or a JSON array if a value contains a comma)',
    }),
    industries: Flags.string({
      description:
        'Filter by industries (comma-separated, or a JSON array if a value contains a comma)',
    }),
  };

  static override examples = [
    '<%= config.bin %> company search --term "fintech" --sizes "11-50,51-200"',
    '<%= config.bin %> company search --term "payments" --industries "Software Development" --json',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(CompanySearch);

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
