import { Flags } from '@oclif/core';
import type { TNetworkEventType } from '@linkedapi/node';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';

export default class NetworkEvents extends BaseCommand {
  static override description = 'Get connection events from the monitored network';

  static override flags = {
    ...BaseCommand.baseFlags,
    since: Flags.string({
      description: 'Retrieve events after ISO timestamp',
    }),
    type: Flags.string({
      description: 'Filter by event type',
      options: ['connectionRequestReceived', 'connectionAccepted', 'connectionAdded'],
    }),
  };

  static override examples = [
    '<%= config.bin %> network events',
    '<%= config.bin %> network events --since 2024-01-15T10:30:00Z --type connectionAccepted',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(NetworkEvents);

    const client = await this.buildAuthenticatedClient();

    try {
      if (!flags.quiet) {
        process.stderr.write('Fetching network events...\n');
      }

      const result = await client.pollNetwork({
        since: flags.since,
        type: flags.type as TNetworkEventType | undefined,
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
