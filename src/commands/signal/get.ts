import { Args } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';

export default class SignalGet extends BaseCommand {
  static override description = 'Get one signal by its id';

  static override args = {
    id: Args.string({
      description: "Signal id, as returned by 'signal create' or 'signal list'",
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> signal get sigsub-123 --json'];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(SignalGet);

    const client = await this.buildAuthenticatedClient();

    try {
      if (!flags.quiet) {
        process.stderr.write('Fetching signal...\n');
      }

      const result = await client.getSignal({ signalId: args.id });

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
