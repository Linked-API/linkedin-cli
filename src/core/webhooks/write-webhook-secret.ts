import { LinkedApiError } from '@linkedapi/node';
import { open } from 'node:fs/promises';

export async function writeWebhookSecret({
  secret,
  isPrintSecret,
  secretFile,
}: {
  secret: string | undefined;
  isPrintSecret: boolean;
  secretFile: string | undefined;
}): Promise<void> {
  if (typeof secret !== 'string' || secret.length === 0) {
    throw new LinkedApiError('httpError', 'The server did not return a signing secret.');
  }

  if (isPrintSecret) {
    process.stdout.write(secret + '\n');
    return;
  }

  if (secretFile === undefined) {
    throw new LinkedApiError('invalidRequestPayload', 'Choose --print-secret or --secret-file.');
  }

  const file = await open(secretFile, 'wx', 0o600);

  try {
    await file.chmod(0o600);
    await file.writeFile(secret + '\n', 'utf8');
  } finally {
    await file.close();
  }
}
