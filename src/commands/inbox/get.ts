import { Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';

export default class InboxGet extends BaseCommand {
  static override description = 'Get messages from the monitored inbox across all conversations';

  static override flags = {
    ...BaseCommand.baseFlags,
    since: Flags.string({
      description: 'Retrieve messages after ISO timestamp',
    }),
    type: Flags.string({
      description: 'Filter by inbox type',
      options: ['st', 'nv'],
    }),
    'thread-id': Flags.string({
      description: 'Restrict to a single conversation thread',
    }),
  };

  static override examples = [
    '<%= config.bin %> inbox get',
    '<%= config.bin %> inbox get --since 2024-01-15T10:30:00Z --type nv',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(InboxGet);

    const client = await this.buildAuthenticatedClient();

    try {
      if (!flags.quiet) {
        process.stderr.write('Fetching inbox...\n');
      }

      const result = await client.pollInbox({
        since: flags.since,
        type: flags.type as 'st' | 'nv' | undefined,
        threadId: flags['thread-id'],
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
