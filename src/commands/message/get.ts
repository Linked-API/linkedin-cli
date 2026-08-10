import { Args, Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { workflowDetails } from '@core/workflow/workflow-details';

export default class MessageGet extends BaseCommand {
  static override description = 'Get conversation messages with a LinkedIn person';

  static override args = {
    'person-url': Args.string({
      description: 'LinkedIn profile URL',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
    since: Flags.string({
      description: 'Retrieve messages since ISO timestamp',
    }),
    days: Flags.integer({
      description: 'How many days to keep the conversation synced, 1-90 (default 30)',
      min: 1,
      max: 90,
    }),
  };

  static override examples = [
    '<%= config.bin %> message get https://www.linkedin.com/in/john-doe',
    '<%= config.bin %> message get https://www.linkedin.com/in/john-doe --since 2024-01-15T10:30:00Z',
    '<%= config.bin %> message get https://www.linkedin.com/in/john-doe --days 14',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MessageGet);

    const client = await this.buildAuthenticatedClient();

    try {
      if (!flags.quiet) {
        process.stderr.write('Fetching conversation...\n');
      }

      // Step 1: Try polling first (fast)
      const conversations = await client.pollConversations([
        {
          personUrl: args['person-url'],
          type: 'st',
          since: flags.since,
        },
      ]);

      if (conversations.errors.length === 0) {
        const data = conversations.data ? conversations.data[0] : undefined;

        formatOutput({
          data,
          errors: [],
          isJson: flags.json,
          fields: flags.fields,
          isQuiet: flags.quiet,
        });
        return;
      }

      // Step 2: Sync conversation (slow, first time only)
      if (!flags.quiet) {
        process.stderr.write('Syncing conversation (first time, may take a moment)...\n');
      }

      const workflow = await workflowDetails.executeWorkflowWithDetails(client.syncConversation, {
        personUrl: args['person-url'],
        days: flags.days,
      });

      if (!flags.quiet && workflow.message) {
        process.stderr.write(`${workflow.message}\n`);
      }

      await client.syncConversation.result(workflow.workflowId);

      // Step 3: Poll again after sync
      const retryResult = await client.pollConversations([
        {
          personUrl: args['person-url'],
          type: 'st',
          since: flags.since,
        },
      ]);

      const data = retryResult.data ? retryResult.data[0] : undefined;

      formatOutput({
        data,
        errors: retryResult.errors,
        isJson: flags.json,
        fields: flags.fields,
        isQuiet: flags.quiet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
