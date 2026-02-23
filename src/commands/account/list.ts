import { Command } from '@oclif/core';

import { listAccounts } from '@core/auth/config-store';

export default class AccountList extends Command {
  static override description = 'List all configured LinkedIn accounts';

  static override examples = ['<%= config.bin %> account list'];

  public async run(): Promise<void> {
    const accounts = listAccounts();

    if (accounts.length === 0) {
      process.stdout.write('No accounts configured. Run "linkedin setup" to add one.\n');
      return;
    }

    for (const account of accounts) {
      const marker = account.isCurrent ? '*' : ' ';
      const truncatedToken = truncateToken(account.identificationToken);
      process.stdout.write(`${marker} ${account.name} (${truncatedToken})\n`);
    }
  }
}

function truncateToken(token: string): string {
  if (token.length <= 12) {
    return token;
  }

  return `${token.slice(0, 6)}...${token.slice(-3)}`;
}
