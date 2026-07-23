import { Args } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';

export default class CommentReply extends BaseCommand {
  static override description = 'Reply to a LinkedIn comment';

  static override args = {
    url: Args.string({
      description: 'LinkedIn comment URL',
      required: true,
    }),
    text: Args.string({
      description: 'Reply text (up to 1000 characters)',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
  };

  static override examples = [
    '<%= config.bin %> comment reply "https://www.linkedin.com/feed/update/urn:li:activity:123/?dashCommentUrn=urn:li:fsd_comment:(456,urn:li:activity:123)" "Well said!"',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(CommentReply);

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {
      commentUrl: args.url,
      text: args.text,
    };

    try {
      const result = await runWorkflow(client.replyToComment, params, {
        isQuiet: flags.quiet,
      });

      formatOutput({
        data: result.data,
        errors: result.errors,
        isJson: flags.json,
        fields: flags.fields,
        isQuiet: flags.quiet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
