import { Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';

export default class InboxSync extends BaseCommand {
  static override description =
    'Enable whole-inbox monitoring so every conversation can be read with "inbox get"';

  static override flags = {
    ...BaseCommand.baseFlags,
    nv: Flags.boolean({
      description: 'Enable monitoring for the Sales Navigator inbox instead of the standard one',
      default: false,
    }),
  };

  static override examples = [
    '<%= config.bin %> inbox sync',
    '<%= config.bin %> inbox sync --nv',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(InboxSync);

    const client = await this.buildAuthenticatedClient();

    try {
      const operation = flags.nv ? client.nvSyncInbox : client.syncInbox;

      const result = await runVoidWorkflow(operation, {}, { isQuiet: flags.quiet });

      formatVoidOutput({
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: flags.nv
          ? 'Sales Navigator inbox monitoring enabled.'
          : 'Inbox monitoring enabled.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
