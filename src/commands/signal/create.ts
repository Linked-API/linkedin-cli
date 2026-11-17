import { Flags } from '@oclif/core';
import {
  SIGNAL_TYPE,
  TCreateSignalParams,
  TSignalPostSearchFilter,
  TSignalType,
} from '@linkedapi/node';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { parsePostSearchActorFilter } from '@utils/post-search-actor-filter';
import { splitListFlag } from '@utils/split-list-flag';

export default class SignalCreate extends BaseCommand {
  static override description = `Create a signal: the account checks one thing on LinkedIn on a schedule and records every new item as an event, read with 'signal events'.

Target flags by type: network and profileViewers take none; personPosts takes --person-url; companyPosts takes --company-url; postSearch takes --term (1 to 3) and optional filter flags; postEngagement takes --post-url or --my-posts.

What checks spend: network and profileViewers spend nothing from account limits. postSearch spends 1 of stSearchQueries per check (30 to 60 of the default 300 a month per signal), so put the wordings of one topic into one signal. personPosts and companyPosts open the profile or company page once on the first check, then spend a few stSearchQueries a day for the whole account and occasional visits. postEngagement spends nothing apart from occasional visits.

Creating a signal that already exists on the account returns it instead of a second one.

See https://linkedapi.io/docs/managing-signals/ for details.`;

  static override flags = {
    ...BaseCommand.baseFlags,
    type: Flags.string({
      description: 'What to watch',
      options: Object.values(SIGNAL_TYPE),
      required: true,
    }),
    label: Flags.string({
      description:
        'Your own identifier, up to 64 characters, returned with the signal and its events',
    }),
    'person-url': Flags.string({
      description: 'personPosts: LinkedIn profile URL of the person',
    }),
    'company-url': Flags.string({
      description: 'companyPosts: LinkedIn company page URL',
    }),
    'post-url': Flags.string({
      description: 'postEngagement: URL of the post whose new comments and reactions to report',
    }),
    'my-posts': Flags.boolean({
      description: "postEngagement: watch comments and reactions on the account's own posts",
      default: false,
    }),
    term: Flags.string({
      description:
        'postSearch: phrase to search as an exact phrase, up to 50 characters; repeat for up to 3 phrases, a post containing any of them is reported',
      multiple: true,
    }),
    'content-type': Flags.string({
      description: 'postSearch filter by content type',
      options: ['videos', 'images', 'jobPosts', 'liveVideos', 'documents'],
    }),
    'posted-by': Flags.string({
      description:
        'postSearch filter by author relationship (comma-separated: me, firstConnections, peopleYouFollow)',
    }),
    'mentioning-members': Flags.string({
      description:
        'postSearch filter by people the post mentions (comma-separated, or a JSON array if a value contains a comma, of name or name:identifier, where the identifier is a member URN or profile URL)',
    }),
    'mentioning-companies': Flags.string({
      description:
        'postSearch filter by companies the post mentions (comma-separated, or a JSON array if a value contains a comma, of name or name:identifier, where the identifier is an organization URN or company URL)',
    }),
    'author-companies': Flags.string({
      description:
        'postSearch filter by companies the author works at (comma-separated, or a JSON array if a value contains a comma, of name or name:identifier, where the identifier is an organization URN or company URL)',
    }),
    'author-industries': Flags.string({
      description:
        'postSearch filter by industries the author works in (comma-separated, or a JSON array if a value contains a comma)',
    }),
  };

  static override examples = [
    '<%= config.bin %> signal create --type network --json',
    '<%= config.bin %> signal create --type personPosts --person-url https://www.linkedin.com/in/john-doe --label lead-1042 --json',
    '<%= config.bin %> signal create --type postSearch --term "user onboarding" --term "time to value" --author-industries "Software Development" --json',
    '<%= config.bin %> signal create --type postEngagement --my-posts --json',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(SignalCreate);

    const filter: TSignalPostSearchFilter = {};
    if (flags['content-type']) {
      filter.contentType = flags['content-type'] as TSignalPostSearchFilter['contentType'];
    }
    if (flags['posted-by']) {
      filter.postedBy = splitListFlag(flags['posted-by']) as TSignalPostSearchFilter['postedBy'];
    }
    if (flags['mentioning-members']) {
      filter.mentioningMembers = parsePostSearchActorFilter({
        value: flags['mentioning-members'],
        actorKind: 'member',
      });
    }
    if (flags['mentioning-companies']) {
      filter.mentioningCompanies = parsePostSearchActorFilter({
        value: flags['mentioning-companies'],
        actorKind: 'company',
      });
    }
    if (flags['author-companies']) {
      filter.authorCompanies = parsePostSearchActorFilter({
        value: flags['author-companies'],
        actorKind: 'company',
      });
    }
    if (flags['author-industries']) {
      filter.authorIndustries = splitListFlag(flags['author-industries']);
    }

    // The flags are flat; the API answers a field that does not belong to the type with
    // invalidRequestPayload naming it.
    const params = {
      type: flags.type as TSignalType,
      label: flags.label,
      personUrl: flags['person-url'],
      companyUrl: flags['company-url'],
      postUrl: flags['post-url'],
      myPosts: flags['my-posts'] ? (true as const) : undefined,
      term: flags.term,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
    };

    const client = await this.buildAuthenticatedClient();

    try {
      if (!flags.quiet) {
        process.stderr.write('Creating signal...\n');
      }

      const result = await client.createSignal(params as TCreateSignalParams);

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
