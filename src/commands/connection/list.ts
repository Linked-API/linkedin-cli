import { Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { splitListFlag } from '@utils/split-list-flag';

export default class ConnectionList extends BaseCommand {
  static override description = 'List your LinkedIn connections';

  static override flags = {
    ...BaseCommand.baseFlags,
    limit: Flags.integer({
      description: 'Max connections to return',
    }),
    since: Flags.string({
      description: 'Retrieve connections made since ISO timestamp',
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
  };

  static override examples = [
    '<%= config.bin %> connection list --limit 50',
    '<%= config.bin %> connection list --current-companies Google --json',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(ConnectionList);

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {};
    if (flags.limit) params.limit = flags.limit;
    if (flags.since) params.since = flags.since;

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

    if (Object.keys(filter).length > 0) {
      params.filter = filter;
    }

    try {
      const result = await runWorkflow(client.retrieveConnections, params, {
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
