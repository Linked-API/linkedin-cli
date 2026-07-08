import { Args } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';

export default class ConnectionIgnore extends BaseCommand {
  static override description = 'Ignore an incoming connection request';

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
    '<%= config.bin %> connection ignore https://www.linkedin.com/in/john-doe',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ConnectionIgnore);

    const client = await this.buildAuthenticatedClient();

    try {
      const result = await runVoidWorkflow(
        client.ignoreConnectionRequest,
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
        successMessage: 'Connection request ignored.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
