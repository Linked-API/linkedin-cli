import { Args, Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';

export default class PersonFetch extends BaseCommand {
  static override description = 'Fetch a LinkedIn person profile';

  static override args = {
    url: Args.string({
      description: 'LinkedIn profile URL',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
    experience: Flags.boolean({
      description: 'Include work experience',
      default: false,
    }),
    education: Flags.boolean({
      description: 'Include education history',
      default: false,
    }),
    skills: Flags.boolean({
      description: 'Include skills',
      default: false,
    }),
    languages: Flags.boolean({
      description: 'Include languages',
      default: false,
    }),
    posts: Flags.boolean({
      description: 'Include posts',
      default: false,
    }),
    comments: Flags.boolean({
      description: 'Include comments',
      default: false,
    }),
    reactions: Flags.boolean({
      description: 'Include reactions',
      default: false,
    }),
    'posts-limit': Flags.integer({
      description: 'Max posts to retrieve',
    }),
    'posts-since': Flags.string({
      description: 'Retrieve posts since ISO timestamp',
    }),
    'comments-limit': Flags.integer({
      description: 'Max comments to retrieve',
    }),
    'comments-since': Flags.string({
      description: 'Retrieve comments since ISO timestamp',
    }),
    'reactions-limit': Flags.integer({
      description: 'Max reactions to retrieve',
    }),
    'reactions-since': Flags.string({
      description: 'Retrieve reactions since ISO timestamp',
    }),
  };

  static override examples = [
    '<%= config.bin %> person fetch https://www.linkedin.com/in/john-doe',
    '<%= config.bin %> person fetch https://www.linkedin.com/in/john-doe --experience --education --json',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(PersonFetch);

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {
      personUrl: args.url,
    };

    if (flags.experience) params.retrieveExperience = true;
    if (flags.education) params.retrieveEducation = true;
    if (flags.skills) params.retrieveSkills = true;
    if (flags.languages) params.retrieveLanguages = true;
    if (flags.posts) params.retrievePosts = true;
    if (flags.comments) params.retrieveComments = true;
    if (flags.reactions) params.retrieveReactions = true;

    if (flags.posts && (flags['posts-limit'] || flags['posts-since'])) {
      const config: Record<string, unknown> = {};
      if (flags['posts-limit']) config.limit = flags['posts-limit'];
      if (flags['posts-since']) config.since = flags['posts-since'];
      params.postsRetrievalConfig = config;
    }

    if (flags.comments && (flags['comments-limit'] || flags['comments-since'])) {
      const config: Record<string, unknown> = {};
      if (flags['comments-limit']) config.limit = flags['comments-limit'];
      if (flags['comments-since']) config.since = flags['comments-since'];
      params.commentsRetrievalConfig = config;
    }

    if (flags.reactions && (flags['reactions-limit'] || flags['reactions-since'])) {
      const config: Record<string, unknown> = {};
      if (flags['reactions-limit']) config.limit = flags['reactions-limit'];
      if (flags['reactions-since']) config.since = flags['reactions-since'];
      params.reactionsRetrievalConfig = config;
    }

    try {
      const result = await runWorkflow(client.fetchPerson, params, {
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
