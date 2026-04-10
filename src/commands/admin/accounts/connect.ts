import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';

export default class AdminAccountsConnect extends AdminBaseCommand {
  static override description = 'Create a connection session to connect a new LinkedIn account';

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin accounts connect'];

  public async run(): Promise<void> {
    const { flags } = await this.parse(AdminAccountsConnect);
    const admin = await this.buildAdminClient();

    try {
      const result = await admin.accounts.createConnectionSession();

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
