import { Args, Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { EXIT_CODE } from '@core/errors/exit-codes';
import { resolveMessagePositionals } from '@core/messaging/resolve-message-positionals';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';

export default class NavigatorMessageSend extends BaseCommand {
  static override description = 'Send a message via Sales Navigator';

  static override args = {
    'person-url': Args.string({
      description: 'LinkedIn profile URL of the recipient (omit when --thread-id is provided)',
      required: false,
    }),
    text: Args.string({
      description: 'Message text, always required (up to 1900 characters)',
      required: false,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
    subject: Flags.string({
      description: 'Message subject line (up to 80 characters); required unless --thread-id is provided',
    }),
    'thread-id': Flags.string({
      description: 'Reply into an existing conversation thread instead of passing person-url',
    }),
  };

  static override examples = [
    '<%= config.bin %> navigator message send https://www.linkedin.com/in/john-doe "Hello!" --subject "Partnership"',
    '<%= config.bin %> navigator message send --thread-id 2-abc123... "Sounds good, talk soon!"',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NavigatorMessageSend);

    const { personUrl, text } = resolveMessagePositionals({
      personUrlArg: args['person-url'],
      textArg: args.text,
      hasThreadId: Boolean(flags['thread-id']),
    });

    if (!personUrl && !flags['thread-id']) {
      this.error('Provide either a person-url argument or the --thread-id flag.', {
        exit: EXIT_CODE.VALIDATION,
      });
    }
    if (!text) {
      this.error('Provide the message text argument.', {
        exit: EXIT_CODE.VALIDATION,
      });
    }
    if (!flags['thread-id'] && !flags.subject) {
      this.error('The --subject flag is required when starting a new conversation.', {
        exit: EXIT_CODE.VALIDATION,
      });
    }

    const client = await this.buildAuthenticatedClient();

    try {
      const result = await runVoidWorkflow(
        client.nvSendMessage,
        {
          personUrl,
          threadId: flags['thread-id'],
          text,
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
