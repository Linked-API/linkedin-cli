import { Args } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';

export default class NavigatorMessageManage extends BaseCommand {
  static override description = 'Archive or unarchive a Sales Navigator conversation thread';

  static override args = {
    'thread-id': Args.string({
      description: 'Conversation thread identifier',
      required: true,
    }),
    operation: Args.string({
      description: 'One of archive, unarchive',
      required: true,
      options: ['archive', 'unarchive'],
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> navigator message manage 2-abc123... archive'];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NavigatorMessageManage);

    const client = await this.buildAuthenticatedClient();

    try {
      const result = await runVoidWorkflow(
        client.nvManageConversation,
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
        successMessage: `Sales Navigator conversation "${args.operation}" applied.`,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
