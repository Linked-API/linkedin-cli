import { Args, Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';

export default class PostCreate extends BaseCommand {
  static override description = 'Create a LinkedIn post';

  static override args = {
    text: Args.string({
      description: 'Post text (up to 3000 characters)',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
    'company-url': Flags.string({
      description: 'Post on behalf of a company page',
    }),
    attachments: Flags.string({
      description: 'Attachments as url:type[:name] (comma-separated, type: image|video|document)',
      multiple: true,
    }),
  };

  static override examples = [
    '<%= config.bin %> post create "Excited to share our latest update!"',
    '<%= config.bin %> post create "Check this out" --attachments "https://example.com/img.jpg:image"',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(PostCreate);

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {
      text: args.text,
    };

    if (flags['company-url']) params.companyUrl = flags['company-url'];

    if (flags.attachments && flags.attachments.length > 0) {
      const attachments = flags.attachments.map((att) => {
        const parts = att.split(':');

        if (parts.length < 2) {
          throw new Error(`Invalid attachment format: "${att}". Expected url:type[:name]`);
        }

        // Rejoin URL parts (URL contains ://)
        const typePart = parts[parts.length - 1]!;
        const nameParts = parts.length > 2 ? parts[parts.length - 2] : undefined;

        let url: string;
        let type: string;
        let name: string | undefined;

        if (['image', 'video', 'document'].includes(typePart)) {
          type = typePart;
          url = parts.slice(0, parts.length - 1).join(':');
        } else if (nameParts && ['image', 'video', 'document'].includes(nameParts)) {
          type = nameParts;
          name = typePart;
          url = parts.slice(0, parts.length - 2).join(':');
        } else {
          throw new Error(
            `Invalid attachment type in "${att}". Must be one of: image, video, document`,
          );
        }

        const result: Record<string, string> = {
          url,
          type,
        };

        if (name) result.name = name;
        return result;
      });

      params.attachments = attachments;
    }

    try {
      const result = await runWorkflow(client.createPost, params, {
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
