import { Flags } from '@oclif/core';
import { SIGNAL_EVENT_TYPE, SIGNAL_TYPE, TSignalEventType, TSignalType } from '@linkedapi/node';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';

export default class SignalEvents extends BaseCommand {
  static override description = `Get the events signals detected, newest first.

Always pass --since with the detectedAt of the newest event you already have, and process each event once by its id: without --since every event of the last 90 days is returned, which can be very large on a busy account.`;

  static override flags = {
    ...BaseCommand.baseFlags,
    since: Flags.string({
      description: 'Retrieve events detected after ISO timestamp',
    }),
    'signal-id': Flags.string({
      description: 'Only events of this signal',
    }),
    'signal-type': Flags.string({
      description: 'Only events of signals of this type',
      options: Object.values(SIGNAL_TYPE),
    }),
    'event-type': Flags.string({
      description: 'Only events of this type',
      options: Object.values(SIGNAL_EVENT_TYPE),
    }),
  };

  static override examples = [
    '<%= config.bin %> signal events --since 2026-10-12T16:40:00.000Z --json -q',
    '<%= config.bin %> signal events --since 2026-10-12T00:00:00Z --signal-type postSearch --event-type postFound --json',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(SignalEvents);

    const client = await this.buildAuthenticatedClient();

    try {
      if (!flags.quiet) {
        process.stderr.write('Fetching signal events...\n');
      }

      const result = await client.pollSignals({
        since: flags.since,
        signalId: flags['signal-id'],
        signalType: flags['signal-type'] as TSignalType | undefined,
        eventType: flags['event-type'] as TSignalEventType | undefined,
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
