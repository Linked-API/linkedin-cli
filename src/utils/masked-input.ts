export function readMaskedInput(prompt: string, visiblePrefix: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(prompt);

    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf-8');

    let input = '';

    const onData = (str: string): void => {
      for (const char of str) {
        if (char === '\n' || char === '\r') {
          stdin.setRawMode(false);
          stdin.removeListener('data', onData);
          stdin.pause();
          process.stdout.write('\n');
          resolve(input);
          return;
        } else if (char === '\u007F' || char === '\b') {
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else if (char === '\u0003') {
          stdin.setRawMode(false);
          process.stdout.write('\n');
          process.exit(0);
        } else if (char >= ' ') {
          input += char;
          const isInPrefix =
            input.length <= visiblePrefix.length && visiblePrefix.startsWith(input);
          process.stdout.write(isInPrefix ? char : '*');
        }
      }
    };

    stdin.on('data', onData);
  });
}
