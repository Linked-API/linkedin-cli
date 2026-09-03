import { Args, Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { EXIT_CODE } from '@core/errors/exit-codes';
import { resolveMessagePositionals } from '@core/messaging/resolve-message-positionals';
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
      description: 'Message text, always required (up to 1900 characters)',
      required: false,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
    'thread-id': Flags.string({
      description: 'Reply into an existing conversation thread instead of passing person-url',
    }),
    manage: Flags.string({
      description: 'Manage the conversation right after sending (acts on the same thread)',
      options: ['archive', 'unarchive', 'star', 'unstar', 'mute', 'unmute'],
    }),
  };

  static override examples = [
    '<%= config.bin %> message send https://www.linkedin.com/in/john-doe "Hello John!"',
    '<%= config.bin %> message send --thread-id 2-abc123... "Sounds good, talk soon!"',
    '<%= config.bin %> message send https://www.linkedin.com/in/john-doe "Hello John!" --manage archive',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MessageSend);

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

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {
      personUrl,
      threadId: flags['thread-id'],
      text,
    };

    if (flags.manage) {
      params.manageConversation = { operation: flags.manage };
    }

    try {
      const result = await runVoidWorkflow(client.sendMessage, params, {
        isQuiet: flags.quiet,
      });

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
