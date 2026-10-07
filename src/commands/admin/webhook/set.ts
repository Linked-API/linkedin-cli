import { AdminBaseCommand } from '@admin-base-command';
import { formatWebhookOutput } from '@core/webhooks/format-webhook-output';
import { parseWebhookEvents } from '@core/webhooks/parse-webhook-events';
import { readWebhookHeaders } from '@core/webhooks/read-webhook-headers';
import { TWebhookPayloadMode } from '@linkedapi/node';
import { Args, Flags } from '@oclif/core';

export default class WebhookSet extends AdminBaseCommand {
  static override description =
    'Register the outbound webhook that receives event deliveries (max one active per client)';

  static override args = {
    url: Args.string({
      description: 'HTTPS endpoint that will receive event deliveries',
      required: true,
    }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
    'payload-mode': Flags.string({
      description: 'fat inlines the workflow result; thin sends a reference to fetch via the API',
      options: ['fat', 'thin'],
      default: 'fat',
    }),
    signing: Flags.boolean({
      description: 'Enable webhook signing; the returned secret is redacted',
    }),
    events: Flags.string({
      description: 'Comma-separated event types or namespace wildcards; omitted selects all events',
    }),
    'headers-stdin': Flags.boolean({
      description: 'Read a JSON object of custom header names and values from stdin',
    }),
  };

  static override examples = [
    '<%= config.bin %> admin webhook set https://example.com/hooks/linkedapi',
    '<%= config.bin %> admin webhook set https://example.com/hooks --payload-mode thin',
    '<%= config.bin %> admin webhook set https://example.com/hooks --signing --events "workflow.*,inbox.messageReceived"',
    'cat headers.json | <%= config.bin %> admin webhook set https://example.com/hooks --headers-stdin',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(WebhookSet);
    const admin = await this.buildAdminClient();

    try {
      const webhook = await admin.webhooks.set({
        url: args.url,
        payloadMode: flags['payload-mode'] as TWebhookPayloadMode,
        ...(flags.signing === undefined ? {} : { signingEnabled: flags.signing }),
        ...(flags.events === undefined ? {} : { events: parseWebhookEvents(flags.events) }),
        ...(flags['headers-stdin'] ? { headers: await readWebhookHeaders() } : {}),
      });

      formatWebhookOutput({
        data: webhook,
        isJson: flags.json,
        fields: flags.fields,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
