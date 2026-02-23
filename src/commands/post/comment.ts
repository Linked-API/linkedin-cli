import { Args, Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';

export default class PostComment extends BaseCommand {
  static override description = 'Comment on a LinkedIn post';

  static override args = {
    url: Args.string({
      description: 'LinkedIn post URL',
      required: true,
    }),
    text: Args.string({
      description: 'Comment text (up to 1000 characters)',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
    'company-url': Flags.string({
      description: 'Comment on behalf of a company page',
    }),
  };

  static override examples = [
    '<%= config.bin %> post comment https://www.linkedin.com/posts/john-doe_activity-123 "Great insights!"',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(PostComment);

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {
      postUrl: args.url,
      text: args.text,
    };

    if (flags['company-url']) params.companyUrl = flags['company-url'];

    try {
      const result = await runVoidWorkflow(client.commentOnPost, params as any, {
        isQuiet: flags.quiet,
      });

      formatVoidOutput({
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: 'Comment posted.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
