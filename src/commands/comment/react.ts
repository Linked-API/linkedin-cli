import { Args, Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';

export default class CommentReact extends BaseCommand {
  static override description = 'React to a LinkedIn comment';

  static override args = {
    url: Args.string({
      description: 'LinkedIn comment URL',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
    type: Flags.string({
      description: 'Reaction type',
      required: true,
      options: ['like', 'love', 'support', 'celebrate', 'insightful', 'funny'],
    }),
  };

  static override examples = [
    '<%= config.bin %> comment react "https://www.linkedin.com/feed/update/urn:li:activity:123/?dashCommentUrn=urn:li:fsd_comment:(456,urn:li:activity:123)" --type like',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(CommentReact);

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {
      commentUrl: args.url,
      type: flags.type,
    };

    try {
      const result = await runVoidWorkflow(client.reactToComment, params, {
        isQuiet: flags.quiet,
      });

      formatVoidOutput({
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: `Reacted with ${flags.type}.`,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
