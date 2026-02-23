import { Args, Command, Flags } from '@oclif/core';

import { findAccountByName, renameAccount } from '@core/auth/config-store';

export default class AccountRename extends Command {
  static override description = 'Rename a saved LinkedIn account';

  static override args = {
    name: Args.string({
      description: 'Current account name (case-insensitive substring match)',
      required: true,
    }),
  };

  static override flags = {
    name: Flags.string({
      description: 'New name for the account',
      required: true,
    }),
  };

  static override examples = [
    '<%= config.bin %> account rename "John" --name "My Work Account"',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(AccountRename);
    const account = findAccountByName(args.name);

    if (!account) {
      process.stderr.write(`Account "${args.name}" not found. Run "linkedin account list" to see available accounts.\n`);
      this.exit(1);
      return;
    }

    const oldName = account.name;
    renameAccount(account.identificationToken, flags.name);
    process.stdout.write(`Renamed "${oldName}" to "${flags.name}".\n`);
  }
}
