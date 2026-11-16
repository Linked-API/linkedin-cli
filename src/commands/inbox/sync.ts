import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';
import { Flags } from '@oclif/core';

export default class InboxSync extends BaseCommand {
  static override description =
    'Enable whole-inbox monitoring so every conversation can be read with "inbox get"';

  static override flags = {
    ...BaseCommand.baseFlags,
    rc: Flags.boolean({
      description:
        "Recruiter Lite inbox. Requires a LinkedIn Recruiter Lite seat and Linked API's Plus plan.",
      default: false,
      exclusive: ['nv'],
    }),
    nv: Flags.boolean({
      description: 'Enable monitoring for the Sales Navigator inbox instead of the standard one',
      default: false,
    }),
  };

  static override examples = ['<%= config.bin %> inbox sync', '<%= config.bin %> inbox sync --nv'];

  public async run(): Promise<void> {
    const { flags } = await this.parse(InboxSync);

    const client = await this.buildAuthenticatedClient();

    try {
      const operation = flags.rc
        ? client.rcSyncInbox
        : flags.nv
          ? client.nvSyncInbox
          : client.syncInbox;

      const result = await runVoidWorkflow(operation, {}, { isQuiet: flags.quiet });

      formatVoidOutput({
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: flags.rc
          ? 'Recruiter Lite inbox monitoring enabled.'
          : flags.nv
            ? 'Sales Navigator inbox monitoring enabled.'
            : 'Inbox monitoring enabled.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
