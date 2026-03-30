import { findAccountByName, listAccounts, updateAccountTokens } from '@core/auth/config-store';
import { buildClient } from '@core/client/build-client';
import { EXIT_CODE } from '@core/errors/exit-codes';
import { Args, Command, Flags } from '@oclif/core';
import { readMaskedInput } from '@utils/masked-input';
import { isStdinTty } from '@utils/tty';

export default class AccountUpdate extends Command {
  static override description = 'Update tokens for a saved LinkedIn account';

  static override args = {
    name: Args.string({
      description:
        'Account name to update (case-insensitive substring match). Defaults to active account.',
    }),
  };

  static override flags = {
    'linked-api-token': Flags.string({
      description: 'New Linked API Token (for non-interactive use)',
    }),
    'identification-token': Flags.string({
      description: 'New Identification Token (for non-interactive use)',
    }),
  };

  static override examples = [
    '<%= config.bin %> account update',
    '<%= config.bin %> account update "John"',
    '<%= config.bin %> account update --linked-api-token=xxx --identification-token=yyy',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(AccountUpdate);

    const account = this.resolveAccount(args.name);

    if (!account) {
      return;
    }

    let linkedApiToken: string;
    let identificationToken: string;

    if (flags['linked-api-token'] && flags['identification-token']) {
      linkedApiToken = flags['linked-api-token'];
      identificationToken = flags['identification-token'];
    } else if (!isStdinTty()) {
      process.stderr.write(`Cannot run interactive update in non-interactive mode.
Use flags instead:

  linkedin account update --linked-api-token=xxx --identification-token=yyy

Get tokens at https://app.linkedapi.io\n`);
      this.exit(EXIT_CODE.AUTH);
      return;
    } else {
      process.stdout.write(
        `Updating tokens for "${account.name}".\n` +
          'Get new tokens at https://app.linkedapi.io\n\n',
      );

      linkedApiToken = await readMaskedInput('New Linked API Token: ', 'account_');
      identificationToken = await readMaskedInput('New Identification Token: ', 'id_');
    }

    if (!linkedApiToken || !identificationToken) {
      process.stderr.write('Both tokens are required.\n');
      this.exit(EXIT_CODE.AUTH);
      return;
    }

    process.stdout.write('Verifying tokens... ');

    let accountName = '';

    try {
      const tempClient = buildClient({
        linkedApiToken,
        identificationToken,
      });
      const accountInfo = await tempClient.getAccountInfo();
      accountName = accountInfo.data?.name ?? '';
      process.stdout.write('OK\n');
    } catch {
      process.stdout.write('FAILED\n');
      process.stderr.write(
        '\nInvalid tokens. Make sure you copied the correct tokens from https://app.linkedapi.io\n',
      );
      this.exit(EXIT_CODE.AUTH);
      return;
    }

    const displayName = accountName || account.name;

    const updated = updateAccountTokens(account.identificationToken, {
      name: displayName,
      linkedApiToken,
      identificationToken,
    });

    if (!updated) {
      process.stderr.write('Failed to update account.\n');
      this.exit(EXIT_CODE.GENERAL);
      return;
    }

    process.stdout.write(`Account "${displayName}" updated successfully.\n`);
  }

  private resolveAccount(
    nameQuery?: string,
  ): { name: string; identificationToken: string } | undefined {
    const accounts = listAccounts();

    if (accounts.length === 0) {
      process.stderr.write('No accounts configured. Run "linkedin setup" to add one.\n');
      this.exit(EXIT_CODE.AUTH);
      return undefined;
    }

    if (nameQuery) {
      const account = findAccountByName(nameQuery);

      if (!account) {
        process.stderr.write(
          `Account "${nameQuery}" not found. Run "linkedin account list" to see available accounts.\n`,
        );
        this.exit(EXIT_CODE.GENERAL);
        return undefined;
      }

      return account;
    }

    const current = accounts.find((account) => account.isCurrent);

    if (!current) {
      process.stderr.write(
        'No active account. Run "linkedin account list" to see available accounts.\n',
      );
      this.exit(EXIT_CODE.AUTH);
      return undefined;
    }

    return current;
  }
}
