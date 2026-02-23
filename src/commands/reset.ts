import { Command, Flags } from '@oclif/core';

import { listAccounts, removeAllAccounts, removeCurrentAccount } from '@core/auth/config-store';

export default class Reset extends Command {
  static override description = 'Remove stored Linked API tokens';

  static override flags = {
    all: Flags.boolean({
      description: 'Remove all accounts',
      default: false,
    }),
  };

  static override examples = [
    '<%= config.bin %> reset',
    '<%= config.bin %> reset --all',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(Reset);

    if (flags.all) {
      const count = removeAllAccounts();

      if (count > 0) {
        process.stdout.write(`Removed ${count} account${count > 1 ? 's' : ''}.\n`);
      } else {
        process.stdout.write('No stored accounts found.\n');
      }

      return;
    }

    const accounts = listAccounts();

    if (accounts.length === 0) {
      process.stdout.write('No stored accounts found.\n');
      return;
    }

    const removed = removeCurrentAccount();

    if (!removed) {
      process.stdout.write('No active account to remove.\n');
      return;
    }

    const remaining = listAccounts();

    if (remaining.length > 0) {
      const next = remaining.find((account) => account.isCurrent);
      process.stdout.write(`Removed "${removed.name}". Switched to "${next?.name}".\n`);
    } else {
      process.stdout.write(`Removed "${removed.name}". No accounts remaining.\n`);
    }
  }
}
