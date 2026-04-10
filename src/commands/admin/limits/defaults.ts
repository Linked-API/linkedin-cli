import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';

export default class AdminLimitsDefaults extends AdminBaseCommand {
  static override description = 'View system default limits';

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin limits defaults'];

  public async run(): Promise<void> {
    const { flags } = await this.parse(AdminLimitsDefaults);
    const admin = await this.buildAdminClient();

    try {
      const { limits } = await admin.limits.getDefaults();

      formatAdminOutput({
        data: limits,
        isJson: flags.json,
        fields: flags.fields,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
