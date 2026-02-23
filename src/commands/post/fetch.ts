import { Args, Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';

export default class PostFetch extends BaseCommand {
  static override description = 'Fetch a LinkedIn post';

  static override args = {
    url: Args.string({
      description: 'LinkedIn post URL',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
    comments: Flags.boolean({
      description: 'Include comments',
      default: false,
    }),
    reactions: Flags.boolean({
      description: 'Include reactions',
      default: false,
    }),
    'comments-limit': Flags.integer({
      description: 'Max comments to retrieve',
    }),
    'comments-sort': Flags.string({
      description: 'Comment sort order',
      options: ['mostRelevant', 'mostRecent'],
    }),
    'comments-replies': Flags.boolean({
      description: 'Include comment replies',
      default: false,
    }),
    'reactions-limit': Flags.integer({
      description: 'Max reactions to retrieve',
    }),
  };

  static override examples = [
    '<%= config.bin %> post fetch https://www.linkedin.com/posts/john-doe_activity-123',
    '<%= config.bin %> post fetch https://www.linkedin.com/posts/john-doe_activity-123 --comments --reactions --json',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(PostFetch);

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {
      postUrl: args.url,
    };

    if (flags.comments) params.retrieveComments = true;
    if (flags.reactions) params.retrieveReactions = true;

    if (
      flags.comments &&
      (flags['comments-limit'] || flags['comments-sort'] || flags['comments-replies'])
    ) {
      const config: Record<string, unknown> = {};
      if (flags['comments-limit']) config.limit = flags['comments-limit'];
      if (flags['comments-sort']) config.sort = flags['comments-sort'];
      if (flags['comments-replies']) config.replies = true;
      params.commentsRetrievalConfig = config;
    }

    if (flags.reactions && flags['reactions-limit']) {
      params.reactionsRetrievalConfig = {
        limit: flags['reactions-limit'],
      };
    }

    try {
      const result = await runWorkflow(client.fetchPost, params as any, {
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
