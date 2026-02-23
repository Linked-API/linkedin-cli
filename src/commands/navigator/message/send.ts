import { Args, Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';

export default class NavigatorMessageSend extends BaseCommand {
  static override description = 'Send a message via Sales Navigator';

  static override args = {
    'person-url': Args.string({
      description: 'LinkedIn profile URL of the recipient',
      required: true,
    }),
    text: Args.string({
      description: 'Message text (up to 1900 characters)',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
    subject: Flags.string({
      description: 'Message subject line (up to 80 characters)',
      required: true,
    }),
  };

  static override examples = [
    '<%= config.bin %> navigator message send https://www.linkedin.com/in/john-doe "Hello!" --subject "Partnership"',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NavigatorMessageSend);

    const client = await this.buildAuthenticatedClient();

    try {
      const result = await runVoidWorkflow(
        client.nvSendMessage,
        {
          personUrl: args['person-url'],
          text: args.text,
          subject: flags.subject,
        },
        {
          isQuiet: flags.quiet,
        },
      );

      formatVoidOutput({
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: 'Sales Navigator message sent.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
