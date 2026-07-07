import { Args } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';

export default class MessageManage extends BaseCommand {
  static override description = 'Archive, star, or mute a conversation thread';

  static override args = {
    'thread-id': Args.string({
      description: 'Conversation thread identifier',
      required: true,
    }),
    operation: Args.string({
      description: 'One of archive, unarchive, star, unstar, mute, unmute',
      required: true,
      options: ['archive', 'unarchive', 'star', 'unstar', 'mute', 'unmute'],
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
  };

  static override examples = [
    '<%= config.bin %> message manage 2-abc123... archive',
    '<%= config.bin %> message manage 2-abc123... unmute',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MessageManage);

    const client = await this.buildAuthenticatedClient();

    try {
      const result = await runVoidWorkflow(
        client.manageConversation,
        {
          threadId: args['thread-id'],
          operation: args.operation,
        },
        {
          isQuiet: flags.quiet,
        },
      );

      formatVoidOutput({
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: `Conversation "${args.operation}" applied.`,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
