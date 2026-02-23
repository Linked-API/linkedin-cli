import { Args, Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';

export default class ConnectionSend extends BaseCommand {
  static override description = 'Send a connection request to a LinkedIn person';

  static override args = {
    url: Args.string({
      description: 'LinkedIn profile URL',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
    note: Flags.string({
      description: 'Personalized note to include with the request',
    }),
    email: Flags.string({
      description: 'Email address (required by some profiles)',
    }),
  };

  static override examples = [
    '<%= config.bin %> connection send https://www.linkedin.com/in/john-doe',
    '<%= config.bin %> connection send https://www.linkedin.com/in/john-doe --note "Love to connect!"',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ConnectionSend);

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {
      personUrl: args.url,
    };

    if (flags.note) params.note = flags.note;
    if (flags.email) params.email = flags.email;

    try {
      const result = await runVoidWorkflow(client.sendConnectionRequest, params as any, {
        isQuiet: flags.quiet,
      });

      formatVoidOutput({
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: 'Connection request sent.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
