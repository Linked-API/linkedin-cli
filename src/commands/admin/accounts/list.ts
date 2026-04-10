import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';

export default class AdminAccountsList extends AdminBaseCommand {
  static override description = 'List all connected accounts and pending sessions';

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin accounts list'];

  public async run(): Promise<void> {
    const { flags } = await this.parse(AdminAccountsList);
    const admin = await this.buildAdminClient();

    try {
      const result = await admin.accounts.getAll();

      formatAdminOutput({
        data: result,
        isJson: flags.json,
        fields: flags.fields,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
