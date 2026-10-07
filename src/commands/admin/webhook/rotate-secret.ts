import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';
import { formatWebhookOutput } from '@core/webhooks/format-webhook-output';
import { writeWebhookSecret } from '@core/webhooks/write-webhook-secret';
import { LinkedApiAdmin, TWebhookSubscription } from '@linkedapi/node';
import { Args, Flags } from '@oclif/core';
import { open, rm } from 'node:fs/promises';

export default class WebhookRotateSecret extends AdminBaseCommand {
  static override description =
    'Rotate the signing secret; the old secret stops working immediately';

  static override args = {
    id: Args.string({ description: 'Webhook subscription id', required: true }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
    'print-secret': Flags.boolean({
      description: 'Print only the raw new signing secret to stdout, overriding output formatting',
      exclusive: ['secret-file'],
    }),
    'secret-file': Flags.string({
      description: 'Create a new secret file with mode 0600; never print the secret',
      exclusive: ['print-secret'],
    }),
  };

  static override examples = [
    '<%= config.bin %> admin webhook rotate-secret whs-123',
    '<%= config.bin %> admin webhook rotate-secret whs-123 --secret-file webhook-secret.txt',
    '<%= config.bin %> admin webhook rotate-secret whs-123 --print-secret',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(WebhookRotateSecret);
    const admin = await this.buildAdminClient();
    process.stderr.write(
      'Warning: rotating the signing secret makes the old secret stop working immediately.\n',
    );

    try {
      const webhook = await this.rotateSecret({
        admin,
        id: args.id,
        secretFile: flags['secret-file'],
      });

      if (flags['print-secret']) {
        await writeWebhookSecret({
          secret: webhook.secret,
          isPrintSecret: true,
          secretFile: undefined,
        });
      } else if (flags['secret-file'] !== undefined) {
        formatAdminOutput({
          data: { secretFile: flags['secret-file'] },
          isJson: flags.json,
          fields: flags.fields,
        });
      } else {
        formatWebhookOutput({ data: webhook, isJson: flags.json, fields: flags.fields });
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  private async rotateSecret({
    admin,
    id,
    secretFile,
  }: {
    admin: LinkedApiAdmin;
    id: string;
    secretFile: string | undefined;
  }): Promise<TWebhookSubscription> {
    if (secretFile === undefined) {
      return admin.webhooks.rotateSecret({ id });
    }

    const file = await open(secretFile, 'wx', 0o600);
    let hasRotated = false;

    try {
      await file.chmod(0o600);
      const webhook = await admin.webhooks.rotateSecret({ id });
      hasRotated = true;

      try {
        if (typeof webhook.secret !== 'string' || webhook.secret.length === 0) {
          throw new Error('The server did not return a signing secret.');
        }

        await file.writeFile(webhook.secret + '\n', 'utf8');
      } catch {
        throw new Error(
          `The signing secret was rotated, but could not be saved. Use "linkedin admin webhook reveal-secret ${id} --secret-file <new-path>" or "--print-secret" to retrieve it.`,
        );
      }

      return webhook;
    } finally {
      await file.close();

      if (!hasRotated) {
        await rm(secretFile);
      }
    }
  }
}
