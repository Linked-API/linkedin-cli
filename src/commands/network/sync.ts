import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';

export default class NetworkSync extends BaseCommand {
  static override description =
    'Enable background network monitoring so connection events can be read with "network events"';

  static override flags = {
    ...BaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> network sync'];

  public async run(): Promise<void> {
    const { flags } = await this.parse(NetworkSync);

    const client = await this.buildAuthenticatedClient();

    try {
      const result = await runVoidWorkflow(client.syncNetwork, {}, { isQuiet: flags.quiet });

      formatVoidOutput({
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: 'Network monitoring enabled.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
