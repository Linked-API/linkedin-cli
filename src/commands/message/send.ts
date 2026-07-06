import { Args, Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { EXIT_CODE } from '@core/errors/exit-codes';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';

export default class MessageSend extends BaseCommand {
  static override description = 'Send a message to a LinkedIn person';

  static override args = {
    'person-url': Args.string({
      description: 'LinkedIn profile URL of the recipient (omit when --thread-id is provided)',
      required: false,
    }),
    text: Args.string({
      description: 'Message text (up to 1900 characters)',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
    'thread-id': Flags.string({
      description: 'Reply into an existing conversation thread instead of passing person-url',
    }),
  };

  static override examples = [
    '<%= config.bin %> message send https://www.linkedin.com/in/john-doe "Hello John!"',
    '<%= config.bin %> message send --thread-id 2-abc123... "Sounds good, talk soon!"',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MessageSend);

    if (!args['person-url'] && !flags['thread-id']) {
      this.error('Provide either a person-url argument or the --thread-id flag.', {
        exit: EXIT_CODE.VALIDATION,
      });
    }

    const client = await this.buildAuthenticatedClient();

    try {
      const result = await runVoidWorkflow(
        client.sendMessage,
        {
          personUrl: args['person-url'],
          threadId: flags['thread-id'],
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
