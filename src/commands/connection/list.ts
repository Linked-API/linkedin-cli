import { Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';

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
    if (flags.locations) filter.locations = flags.locations.split(',').map((s) => s.trim());
    if (flags.industries) filter.industries = flags.industries.split(',').map((s) => s.trim());
    if (flags['current-companies'])
      filter.currentCompanies = flags['current-companies'].split(',').map((s) => s.trim());
    if (flags['previous-companies'])
      filter.previousCompanies = flags['previous-companies'].split(',').map((s) => s.trim());
    if (flags.schools) filter.schools = flags.schools.split(',').map((s) => s.trim());

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
