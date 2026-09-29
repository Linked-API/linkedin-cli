import { Args, Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { parsePostMention } from '@utils/post-mention';
import { buildPostTarget } from '@utils/post-target';

export default class PostRepost extends BaseCommand {
  static override description = 'Repost a LinkedIn post, as is or with your own commentary';

  static override args = {
    url: Args.string({
      description: 'LinkedIn post URL or URN',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
    text: Flags.string({
      description: 'Your own commentary (up to 3000 characters)',
    }),
    mention: Flags.string({
      description: 'Mention as key:name[:identifier], bound to @[key] in the commentary',
      multiple: true,
    }),
  };

  static override examples = [
    '<%= config.bin %> post repost https://www.linkedin.com/posts/john-doe_activity-123',
    '<%= config.bin %> post repost urn:li:activity:1234567890123456789 --text "Worth reading."',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(PostRepost);

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {
      ...buildPostTarget(args.url),
    };

    if (flags.text) params.text = flags.text;

    if (flags.mention && flags.mention.length > 0) {
      params.mentions = flags.mention.map((mention) => parsePostMention(mention));
    }

    try {
      const result = await runWorkflow(client.createRepost, params, {
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
