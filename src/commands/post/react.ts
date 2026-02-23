import { Args, Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';

export default class PostReact extends BaseCommand {
  static override description = 'React to a LinkedIn post';

  static override args = {
    url: Args.string({
      description: 'LinkedIn post URL',
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
    'company-url': Flags.string({
      description: 'React on behalf of a company page',
    }),
  };

  static override examples = [
    '<%= config.bin %> post react https://www.linkedin.com/posts/john-doe_activity-123 --type like',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(PostReact);

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {
      postUrl: args.url,
      type: flags.type,
    };

    if (flags['company-url']) params.companyUrl = flags['company-url'];

    try {
      const result = await runVoidWorkflow(client.reactToPost, params, {
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
