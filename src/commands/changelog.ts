import { BaseCommand } from '@base-command';
import { getChangelog, LinkedApiError } from '@linkedapi/node';
import { Flags } from '@oclif/core';
import { isStdoutTty } from '@utils/tty';

export default class Changelog extends BaseCommand {
  static override description =
    'Read the public Linked API changelog; no authentication is required';

  static override flags = {
    ...BaseCommand.baseFlags,
    fields: { ...BaseCommand.baseFlags.fields, hidden: true },
    account: { ...BaseCommand.baseFlags.account, hidden: true },
    since: Flags.string({ description: 'Return releases since an ISO date or zoned instant' }),
  };

  static override examples = [
    '<%= config.bin %> changelog',
    '<%= config.bin %> changelog --since 2026-10-01',
    '<%= config.bin %> changelog --since 2026-10-01T12:00:00Z --json',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(Changelog);

    try {
      const changelog = await getChangelog({ since: flags.since }).catch(
        (error: unknown): never => {
          if (error instanceof LinkedApiError) {
            throw error;
          }

          const message = error instanceof Error ? error.message : String(error);
          const isHttpError =
            error instanceof TypeError ||
            error instanceof SyntaxError ||
            message.startsWith('HTTP ');
          throw new LinkedApiError(
            isHttpError ? 'httpError' : 'invalidRequestPayload',
            isHttpError ? 'Request error: ' + message : message,
          );
        },
      );

      if (flags.json || !isStdoutTty()) {
        process.stdout.write(JSON.stringify(changelog, null, 2) + '\n');
        return;
      }

      if (changelog.entries.length === 0) {
        this.log('(no releases)');
        return;
      }

      const releases = [...changelog.entries].sort((a, b) => b.date.localeCompare(a.date));

      for (const { date, items } of releases) {
        this.log(date);

        for (const { title, body, docs } of items) {
          this.log(`\n${title}\n${body}\nhttps://linkedapi.io${docs}`);
        }

        this.log('');
      }
    } catch (error) {
      this.handleError(error);
    }
  }
}
