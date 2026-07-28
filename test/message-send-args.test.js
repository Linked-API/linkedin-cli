const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it, before } = require('node:test');

const RUN = path.join(__dirname, '..', 'bin', 'run.js');
const EMPTY_CONFIG_HOME = path.join(__dirname, '.tmp-config');

// Port 1 is never bound, so a request can only fail to connect. The commands under test must stop at
// the auth check long before this matters; it is here so a regression can never reach LinkedIn.
const UNREACHABLE_API = 'http://127.0.0.1:1';

const EXIT_AUTH = 2;
const EXIT_VALIDATION = 5;

function runCli(args) {
  try {
    const stdout = execFileSync(process.execPath, [RUN, ...args], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30_000,
      env: {
        ...process.env,
        XDG_CONFIG_HOME: EMPTY_CONFIG_HOME,
        LINKED_API_BASE_URL: UNREACHABLE_API,
        NO_COLOR: '1',
      },
    });

    return { exitCode: 0, stdout, stderr: '' };
  } catch (error) {
    return {
      exitCode: error.status,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? '',
    };
  }
}

function assertReachedAuthCheck(result) {
  assert.doesNotMatch(result.stderr, /Invalid argument spec/);
  assert.match(result.stderr, /Authentication required/);
  assert.equal(result.exitCode, EXIT_AUTH);
}

describe('message send argument spec', () => {
  before(() => {
    fs.rmSync(EMPTY_CONFIG_HOME, { recursive: true, force: true });
  });

  it('accepts the documented <person-url> <text> form', () => {
    const result = runCli(['message', 'send', 'https://www.linkedin.com/in/john-doe', 'Hello John!']);

    assertReachedAuthCheck(result);
  });

  it('binds the single positional to the text when --thread-id is given', () => {
    const result = runCli(['message', 'send', '--thread-id', '2-abc123', 'Sounds good, talk soon!']);

    assertReachedAuthCheck(result);
  });

  it('rejects a call with no recipient and no thread id', () => {
    const result = runCli(['message', 'send']);

    assert.equal(result.exitCode, EXIT_VALIDATION);
    assert.match(result.stderr, /person-url|thread-id/);
  });

  it('rejects a recipient with no message text', () => {
    const result = runCli(['message', 'send', 'https://www.linkedin.com/in/john-doe']);

    assert.equal(result.exitCode, EXIT_VALIDATION);
    assert.match(result.stderr, /message text/);
  });
});

describe('navigator message send argument spec', () => {
  before(() => {
    fs.rmSync(EMPTY_CONFIG_HOME, { recursive: true, force: true });
  });

  it('accepts the documented <person-url> <text> form', () => {
    const result = runCli([
      'navigator',
      'message',
      'send',
      'https://www.linkedin.com/in/john-doe',
      'Hello!',
      '--subject',
      'Partnership',
    ]);

    assertReachedAuthCheck(result);
  });

  it('binds the single positional to the text when --thread-id is given', () => {
    const result = runCli([
      'navigator',
      'message',
      'send',
      '--thread-id',
      '2-abc123',
      'Sounds good, talk soon!',
    ]);

    assertReachedAuthCheck(result);
  });

  it('rejects a recipient with no message text', () => {
    const result = runCli([
      'navigator',
      'message',
      'send',
      'https://www.linkedin.com/in/john-doe',
      '--subject',
      'Partnership',
    ]);

    assert.equal(result.exitCode, EXIT_VALIDATION);
    assert.match(result.stderr, /message text/);
  });
});
