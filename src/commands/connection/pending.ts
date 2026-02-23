import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';

export default class ConnectionPending extends BaseCommand {
  static override description = 'List pending connection requests';

  static override flags = {
    ...BaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> connection pending --json'];

  public async run(): Promise<void> {
    const { flags } = await this.parse(ConnectionPending);

    const client = await this.buildAuthenticatedClient();

    try {
      const result = await runWorkflow(client.retrievePendingRequests, undefined as unknown as void, {
        isQuiet: flags.quiet,
      });

      formatOutput({
        data: result.data,
        errors: result.errors,
        isJson: flags.json,
        fields: flags.fields,
        isQuiet: flags.quiet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
