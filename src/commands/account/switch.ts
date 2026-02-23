import { Args, Command } from '@oclif/core';

import { findAccountByName, setCurrentAccount } from '@core/auth/config-store';

export default class AccountSwitch extends Command {
  static override description = 'Switch the active LinkedIn account';

  static override args = {
    name: Args.string({
      description: 'Account name (case-insensitive substring match)',
      required: true,
    }),
  };

  static override examples = [
    '<%= config.bin %> account switch "John Doe"',
  ];

  public async run(): Promise<void> {
    const { args } = await this.parse(AccountSwitch);
    const account = findAccountByName(args.name);

    if (!account) {
      process.stderr.write(`Account "${args.name}" not found. Run "linkedin account list" to see available accounts.\n`);
      this.exit(1);
      return;
    }

    setCurrentAccount(account.identificationToken);
    process.stdout.write(`Switched to "${account.name}".\n`);
  }
}
