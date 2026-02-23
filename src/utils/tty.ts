export function isStdoutTty(): boolean {
  return process.stdout.isTTY === true;
}

export function isStdinTty(): boolean {
  return process.stdin.isTTY === true;
}

export function isColorEnabled(): boolean {
  if (process.env.NO_COLOR !== undefined) {
    return false;
  }

  return isStdoutTty();
}
