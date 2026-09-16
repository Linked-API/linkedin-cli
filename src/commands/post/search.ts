import { Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';

export default class PostSearch extends BaseCommand {
  static override description = 'Search for posts on LinkedIn';

  static override flags = {
    ...BaseCommand.baseFlags,
    term: Flags.string({
      description: 'Search keyword or phrase, up to 50 characters',
    }),
    limit: Flags.integer({
      description: 'Max results to return, up to 100',
    }),
    sort: Flags.string({
      description: 'Sort order of the results',
      options: ['topMatch', 'latest'],
    }),
    'date-posted': Flags.string({
      description: 'Filter by how recently the post was published',
      options: ['past24Hours', 'pastWeek', 'pastMonth'],
    }),
    'content-type': Flags.string({
      description: 'Filter by content type',
      options: ['videos', 'images', 'jobPosts', 'liveVideos', 'documents'],
    }),
    'posted-by': Flags.string({
      description:
        'Filter by author relationship (comma-separated: me, firstConnections, peopleYouFollow)',
    }),
    'from-members': Flags.string({
      description: 'Filter by names of people whose posts to keep (comma-separated)',
    }),
    'from-companies': Flags.string({
      description: 'Filter by names of companies whose posts to keep (comma-separated)',
    }),
    'mentioning-members': Flags.string({
      description: 'Filter by names of people the post must mention (comma-separated)',
    }),
    'mentioning-companies': Flags.string({
      description: 'Filter by names of companies the post must mention (comma-separated)',
    }),
    'author-companies': Flags.string({
      description: 'Filter by names of companies the author works at (comma-separated)',
    }),
    'author-industries': Flags.string({
      description: 'Filter by industries the author works in (comma-separated)',
    }),
  };

  static override examples = [
    '<%= config.bin %> post search --term "climate tech" --date-posted pastWeek --json',
    '<%= config.bin %> post search --term "product launch" --content-type images --sort latest --limit 20 --json',
    '<%= config.bin %> post search --term "hiring" --from-companies "Linked API" --posted-by "peopleYouFollow" --json',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(PostSearch);

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {};
    if (flags.term) params.term = flags.term;
    if (flags.limit) params.limit = flags.limit;

    const filter: Record<string, unknown> = {};
    if (flags.sort) filter.sort = flags.sort;
    if (flags['date-posted']) filter.datePosted = flags['date-posted'];
    if (flags['content-type']) filter.contentType = flags['content-type'];
    if (flags['posted-by']) filter.postedBy = splitCsv(flags['posted-by']);
    if (flags['from-members']) filter.fromMembers = splitCsv(flags['from-members']);
    if (flags['from-companies']) filter.fromCompanies = splitCsv(flags['from-companies']);
    if (flags['mentioning-members'])
      filter.mentioningMembers = splitCsv(flags['mentioning-members']);
    if (flags['mentioning-companies'])
      filter.mentioningCompanies = splitCsv(flags['mentioning-companies']);
    if (flags['author-companies']) filter.authorCompanies = splitCsv(flags['author-companies']);
    if (flags['author-industries']) filter.authorIndustries = splitCsv(flags['author-industries']);

    if (Object.keys(filter).length > 0) {
      params.filter = filter;
    }

    try {
      const result = await runWorkflow(client.searchPosts, params, {
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

function splitCsv(value: string): Array<string> {
  return value.split(',').map((s) => s.trim());
}
