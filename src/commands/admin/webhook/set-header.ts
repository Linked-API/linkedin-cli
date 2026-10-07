import { AdminBaseCommand } from '@admin-base-command';
import { formatWebhookOutput } from '@core/webhooks/format-webhook-output';
import { LinkedApiError } from '@linkedapi/node';
import { Args, Flags } from '@oclif/core';
import { readStdin } from '@utils/read-stdin';

export default class WebhookSetHeader extends AdminBaseCommand {
  static override description = 'Set one custom webhook header without passing its value in argv';

  static override args = {
    id: Args.string({ description: 'Webhook subscription id', required: true }),
    name: Args.string({ description: 'Custom header name (case-insensitive)', required: true }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
    'value-stdin': Flags.boolean({
      description: 'Read the value from stdin; one trailing newline is removed',
      exactlyOne: ['value-stdin', 'value-env'],
    }),
    'value-env': Flags.string({
      description: 'Name of the environment variable containing the header value',
      exactlyOne: ['value-stdin', 'value-env'],
    }),
  };

  static override examples = [
    'cat header-token.txt | <%= config.bin %> admin webhook set-header whs-123 x-receiver-token --value-stdin',
    '<%= config.bin %> admin webhook set-header whs-123 x-receiver-token --value-env WEBHOOK_HEADER_TOKEN',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(WebhookSetHeader);
    const admin = await this.buildAdminClient();

    try {
      const value = flags['value-stdin']
        ? (await readStdin()).replace(/\r?\n$/, '')
        : process.env[flags['value-env']!];

      if (value === undefined) {
        throw new LinkedApiError(
          'invalidRequestPayload',
          'The header value environment variable is not set.',
        );
      }

      if (value.length === 0) {
        throw new LinkedApiError(
          'invalidRequestPayload',
          'The header value is empty; use delete-header to remove a header.',
        );
      }

      const webhook = await admin.webhooks.setHeader({ id: args.id, name: args.name, value });
      formatWebhookOutput({ data: webhook, isJson: flags.json, fields: flags.fields });
    } catch (error) {
      this.handleError(error);
    }
  }
}
