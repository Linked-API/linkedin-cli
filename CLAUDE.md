# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Product

**linkedin-cli** is an AI-agent-friendly CLI for LinkedIn automation via [Linked API](https://linkedapi.io). It wraps the `linkedapi-node` SDK (v1.2.14) to give AI agents (Claude Code, Cursor, Codex, etc.) a token-efficient interface to control LinkedIn.

**Package:** `linkedin-cli` on npm, binary: `linkedin`
**Framework:** oclif (TypeScript CLI framework by Salesforce)

## Build Commands

```bash
npm ci                # Install dependencies
npm run build         # tsc + tsc-alias + oclif manifest
npm run typecheck     # Type check without emitting
npm run lint          # ESLint with auto-fix
npm run format        # Prettier
```

## Architecture

```
User/Agent -> CLI (oclif command) -> linkedapi-node SDK -> Linked API HTTP endpoints
```

Every command:
1. Resolves auth tokens via `auth-manager.ts` (config file -> error)
2. Creates SDK instance via `build-client.ts`
3. Calls `operation.execute(params)` -> gets workflowId
4. Polls via `operation.result(workflowId)` with progress on stderr
5. Outputs result to stdout (JSON or table based on TTY)

## Path Aliases

Defined in `tsconfig.json`, resolved at build time by `tsc-alias`:

- `@base-command` -> `src/base-command`
- `@core/*` -> `src/core/*`
- `@utils/*` -> `src/utils/*`

All imports MUST use aliases (not relative paths) when crossing module boundaries.

## Code Style

Follows the same conventions as `linkedapi-node` and `linkedapi-mcp`:
- See root `CODESTYLE.md` for TypeScript conventions
- Types prefixed with `T`, interfaces prefixed with `T`
- `as const` objects over enums
- Single export per file (with constant + derived type exception)
- `Array<T>` syntax over `T[]`

## Error Handling (Three Levels)

1. **Request errors** (SDK throws `LinkedApiError`) -> non-zero exit, JSON on stderr
2. **Workflow failures** (SDK throws `LinkedApiError`) -> exit 1, JSON on stderr
3. **Action outcomes** (returned in `result.errors`) -> exit 0, `{success: false}` on stdout

Exit codes: 0=success, 1=general, 2=auth, 3=subscription, 4=account, 5=validation, 6=rate-limit, 7=network, 8=timeout

## Key Files

| File | Purpose |
|------|---------|
| `src/base-command.ts` | Abstract base for all commands (global flags, auth, error handling) |
| `src/core/auth/auth-manager.ts` | Token resolution: config file -> error, supports `--account` override |
| `src/core/auth/config-store.ts` | Multi-account config at `~/.config/linkedin-cli/config.json` |
| `src/core/client/build-client.ts` | Build LinkedApi instance |
| `src/core/errors/exit-codes.ts` | Semantic exit codes |
| `src/core/errors/error-handler.ts` | Map SDK errors -> exit codes + messages |
| `src/core/output/formatter.ts` | JSON/table output with response envelope |
| `src/core/output/field-selector.ts` | `--fields` filtering |
| `src/core/workflow/workflow-runner.ts` | execute + poll with stderr progress |
| `src/commands/message/get.ts` | Sync-then-poll pattern for conversations |
