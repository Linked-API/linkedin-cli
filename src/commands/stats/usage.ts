import { Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';

export default class StatsUsage extends BaseCommand {
  static override description = 'Retrieve Linked API usage statistics';

  static override flags = {
    ...BaseCommand.baseFlags,
    start: Flags.string({
      description: 'Start date (ISO timestamp)',
      required: true,
    }),
    end: Flags.string({
      description: 'End date (ISO timestamp)',
      required: true,
    }),
  };

  static override examples = [
    '<%= config.bin %> stats usage --start 2024-01-01T00:00:00Z --end 2024-01-31T00:00:00Z --json',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(StatsUsage);

    const client = await this.buildAuthenticatedClient();

    try {
      if (!flags.quiet) {
        process.stderr.write('Fetching usage statistics...\n');
      }

      const result = await client.getApiUsage({
        start: flags.start,
        end: flags.end,
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
