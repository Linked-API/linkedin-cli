import { LinkedApiError } from '@linkedapi/node';
import { isStdinTty } from '@utils/tty';

export async function readStdin(): Promise<string> {
  if (isStdinTty()) {
    throw new LinkedApiError('invalidRequestPayload', 'Pipe the input to stdin.');
  }

  process.stdin.setEncoding('utf8');
  let input = '';

  for await (const chunk of process.stdin) {
    input += chunk;
  }

  return input;
}
