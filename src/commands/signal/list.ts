import { Flags } from '@oclif/core';
import { SIGNAL_STATUS, SIGNAL_TYPE, TSignalStatus, TSignalType } from '@linkedapi/node';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';

export default class SignalList extends BaseCommand {
  static override description = `List the account's signals with their status, baselineAt, lastCheckedAt and nextCheckAt.

A stopped signal (stoppedReason targetNotFound or watchPeriodEnded) cannot be resumed; delete it and create it again.`;

  static override flags = {
    ...BaseCommand.baseFlags,
    type: Flags.string({
      description: 'Only signals of this type',
      options: Object.values(SIGNAL_TYPE),
    }),
    status: Flags.string({
      description: 'Only signals with this status',
      options: Object.values(SIGNAL_STATUS),
    }),
  };

  static override examples = [
    '<%= config.bin %> signal list --json',
    '<%= config.bin %> signal list --type personPosts --status active --json',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(SignalList);

    const client = await this.buildAuthenticatedClient();

    try {
      if (!flags.quiet) {
        process.stderr.write('Fetching signals...\n');
      }

      const result = await client.getSignals({
        type: flags.type as TSignalType | undefined,
        status: flags.status as TSignalStatus | undefined,
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
