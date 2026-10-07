import { AdminBaseCommand } from '@admin-base-command';
import { EXIT_CODE } from '@core/errors/exit-codes';
import { formatWebhookOutput } from '@core/webhooks/format-webhook-output';
import { parseWebhookEvents } from '@core/webhooks/parse-webhook-events';
import { Args, Flags } from '@oclif/core';

export default class WebhookSetEvents extends AdminBaseCommand {
  static override description =
    'Select webhook event types or namespace wildcards; tests always deliver';

  static override args = {
    id: Args.string({ description: 'Webhook subscription id', required: true }),
    events: Args.string({ description: 'Comma-separated list of event selectors' }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
    all: Flags.boolean({ description: 'Deliver all current and future event types' }),
  };

  static override examples = [
    '<%= config.bin %> admin webhook set-events whs-123 "workflow.*,inbox.messageReceived"',
    '<%= config.bin %> admin webhook set-events whs-123 --all',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(WebhookSetEvents);
    const hasEvents = args.events !== undefined;

    if (hasEvents === Boolean(flags.all)) {
      this.error('Provide either an event list or --all.', { exit: EXIT_CODE.VALIDATION });
    }

    const admin = await this.buildAdminClient();

    try {
      const webhook = await admin.webhooks.setEvents({
        id: args.id,
        events: flags.all ? null : parseWebhookEvents(args.events!),
      });

      formatWebhookOutput({ data: webhook, isJson: flags.json, fields: flags.fields });
    } catch (error) {
      this.handleError(error);
    }
  }
}
