import { Args } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';

export default class SignalDelete extends BaseCommand {
  static override description =
    "Delete a signal: its checks stop at once, and the events it produced stay available in 'signal events' for 90 days";

  static override args = {
    id: Args.string({
      description: "Signal id, as returned by 'signal create' or 'signal list'",
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> signal delete sigsub-123 --json'];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(SignalDelete);

    const client = await this.buildAuthenticatedClient();

    try {
      if (!flags.quiet) {
        process.stderr.write('Deleting signal...\n');
      }

      const result = await client.deleteSignal({ signalId: args.id });

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
