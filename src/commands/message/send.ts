import { Args } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';

export default class MessageSend extends BaseCommand {
  static override description = 'Send a message to a LinkedIn person';

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
  };

  static override examples = [
    '<%= config.bin %> message send https://www.linkedin.com/in/john-doe "Hello John!"',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MessageSend);

    const client = await this.buildAuthenticatedClient();

    try {
      const result = await runVoidWorkflow(
        client.sendMessage,
        {
          personUrl: args['person-url'],
          text: args.text,
        },
        {
          isQuiet: flags.quiet,
        },
      );

      formatVoidOutput({
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: 'Message sent.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
