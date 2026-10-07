import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';
import { writeWebhookSecret } from '@core/webhooks/write-webhook-secret';
import { Args, Flags } from '@oclif/core';

export default class WebhookRevealSecret extends AdminBaseCommand {
  static override description =
    'Retrieve the signing secret through an explicit secure output choice';

  static override args = {
    id: Args.string({ description: 'Webhook subscription id', required: true }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
    'print-secret': Flags.boolean({
      description: 'Print only the raw signing secret to stdout, overriding output formatting',
      exactlyOne: ['print-secret', 'secret-file'],
    }),
    'secret-file': Flags.string({
      description: 'Create a new secret file with mode 0600; never print the secret',
      exactlyOne: ['print-secret', 'secret-file'],
    }),
  };

  static override examples = [
    '<%= config.bin %> admin webhook reveal-secret whs-123 --secret-file webhook-secret.txt',
    '<%= config.bin %> admin webhook reveal-secret whs-123 --print-secret',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(WebhookRevealSecret);
    const admin = await this.buildAdminClient();

    try {
      const webhook = await admin.webhooks.revealSecret({ id: args.id });
      await writeWebhookSecret({
        secret: webhook.secret,
        isPrintSecret: flags['print-secret'] === true,
        secretFile: flags['secret-file'],
      });

      if (!flags['print-secret']) {
        formatAdminOutput({
          data: { secretFile: flags['secret-file'] },
          isJson: flags.json,
          fields: flags.fields,
        });
      }
    } catch (error) {
      this.handleError(error);
    }
  }
}
