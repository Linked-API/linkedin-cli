import { Args } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';

export default class ConnectionStatus extends BaseCommand {
  static override description = 'Check connection status with a LinkedIn person';

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
    '<%= config.bin %> connection status https://www.linkedin.com/in/john-doe',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ConnectionStatus);

    const client = await this.buildAuthenticatedClient();

    try {
      const result = await runWorkflow(
        client.checkConnectionStatus,
        {
          personUrl: args.url,
        },
        {
          isQuiet: flags.quiet,
        },
      );

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
