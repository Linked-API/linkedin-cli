import { Args } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';

export default class ConnectionRemove extends BaseCommand {
  static override description = 'Remove a LinkedIn connection';

  static override args = {
    url: Args.string({
      description: 'LinkedIn profile URL',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
  };

  static override examples = [
    '<%= config.bin %> connection remove https://www.linkedin.com/in/john-doe',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ConnectionRemove);

    const client = await this.buildAuthenticatedClient();

    try {
      const result = await runVoidWorkflow(
        client.removeConnection,
        {
          personUrl: args.url,
        },
        {
          isQuiet: flags.quiet,
        },
      );

      formatVoidOutput({
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: 'Connection removed.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
