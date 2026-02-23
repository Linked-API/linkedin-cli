# linkedin-cli

CLI for AI agents to automate LinkedIn via [Linked API](https://linkedapi.io).

Give your AI agent full LinkedIn capabilities: send messages, fetch profiles, search people and companies, manage connections, create posts, react, comment – all through simple CLI commands with structured JSON output. Built for Claude Code, Cursor, Codex, and any AI agent that can execute shell commands.

Under the hood, [Linked API](https://linkedapi.io) runs a dedicated cloud browser instance for each connected LinkedIn account. When your agent runs a command, the CLI sends the request to Linked API's infrastructure, where an isolated browser with a residential IP performs the action on LinkedIn – simulating human-like mouse movements, keyboard input, and natural browsing patterns. No local browsers, no proxies, no Selenium, no infrastructure to manage.

Your LinkedIn credentials are used only once during the initial account connection on the [platform](https://app.linkedapi.io) and are never stored. All subsequent interaction happens exclusively through private API tokens. Each account is fully isolated, and configurable action limits prevent LinkedIn policy violations. [Learn more about safety](https://linkedapi.io/safety).

## Install

```bash
npm install -g linkedin-cli
```

## Authentication

```bash
linkedin setup
```

The CLI will ask for your **Linked API Token** and **Identification Token**. Get them at [app.linkedapi.io](https://app.linkedapi.io).

For non-interactive environments (CI, scripts):

```bash
linkedin setup --linked-api-token=xxx --identification-token=yyy
```

### Multiple accounts

Run `linkedin setup` again with different tokens to add more accounts. The last added account becomes active.

```bash
# List all accounts (* marks active)
linkedin account list

# Switch active account
linkedin account switch "John Doe"

# Use a specific account for one command
linkedin person fetch https://www.linkedin.com/in/... --account "John Doe"

# Remove active account (auto-switches to next)
linkedin reset

# Remove all accounts
linkedin reset --all
```

## Usage

### People

```bash
# Fetch a person profile
linkedin person fetch https://www.linkedin.com/in/john-doe

# Fetch with experience and posts
linkedin person fetch https://www.linkedin.com/in/john-doe --experience --posts --json

# Search for people
linkedin person search --term "software engineer" --locations "San Francisco" --json
```

### Companies

```bash
# Fetch a company
linkedin company fetch https://www.linkedin.com/company/microsoft --json

# Fetch with employees and decision makers
linkedin company fetch https://www.linkedin.com/company/google --employees --dms

# Search companies
linkedin company search --term "fintech" --sizes "11-50,51-200" --json
```

### Messages

```bash
# Send a message
linkedin message send https://www.linkedin.com/in/john-doe "Hello John!"

# Get conversation
linkedin message get https://www.linkedin.com/in/john-doe --json
linkedin message get https://www.linkedin.com/in/john-doe --since 2024-01-15T10:30:00Z
```

### Connections

```bash
# Check connection status
linkedin connection status https://www.linkedin.com/in/john-doe

# Send connection request
linkedin connection send https://www.linkedin.com/in/john-doe --note "Love to connect!"

# List connections
linkedin connection list --limit 50 --json

# Pending requests
linkedin connection pending --json

# Withdraw request
linkedin connection withdraw https://www.linkedin.com/in/john-doe

# Remove connection
linkedin connection remove https://www.linkedin.com/in/john-doe
```

### Posts

```bash
# Fetch a post
linkedin post fetch https://www.linkedin.com/posts/john-doe_activity-123 --comments --reactions

# Create a post
linkedin post create "Excited to share our latest update!"

# React to a post
linkedin post react https://www.linkedin.com/posts/john-doe_activity-123 --type like

# Comment on a post
linkedin post comment https://www.linkedin.com/posts/john-doe_activity-123 "Great insights!"
```

### Statistics

```bash
# Social Selling Index
linkedin stats ssi --json

# Performance analytics
linkedin stats performance --json

# API usage
linkedin stats usage --start 2024-01-01T00:00:00Z --end 2024-01-31T00:00:00Z --json
```

### Sales Navigator

```bash
# Person
linkedin navigator person fetch https://www.linkedin.com/in/ACwAAA...
linkedin navigator person search --term "VP Marketing" --locations "United States"

# Company
linkedin navigator company fetch https://www.linkedin.com/sales/company/1035 --employees
linkedin navigator company search --term "fintech" --revenue-min 1 --revenue-max 50

# Messages
linkedin navigator message send https://www.linkedin.com/in/john-doe "Hello!" --subject "Partnership"
linkedin navigator message get https://www.linkedin.com/in/john-doe
```

### Custom Workflows

```bash
# Run from file
linkedin workflow run --file workflow.json

# Pipe from stdin
cat workflow.json | linkedin workflow run

# Check status / wait for completion
linkedin workflow status abc123
linkedin workflow status abc123 --wait --json
```

## Global Flags

Every command supports:

| Flag | Description |
|------|-------------|
| `--json` | Structured JSON output to stdout |
| `--fields name,url,...` | Select specific fields in output |
| `--quiet` / `-q` | Suppress stderr progress |
| `--no-color` | Disable colors |
| `--account "Name"` | Use a specific account (when multiple are configured) |

## Output Format

### JSON mode (`--json` or non-TTY stdout)

```json
{"success": true, "data": {"name": "John Doe", "headline": "Engineer"}}
```

```json
{"success": false, "error": {"type": "personNotFound", "message": "Person not found"}}
```

### Human mode (TTY stdout)

Key-value pairs for objects, tables for arrays.

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success (check `success` field – action may have returned an error like "person not found") |
| 1 | General/unexpected error |
| 2 | Missing or invalid tokens |
| 3 | Subscription/plan required |
| 4 | LinkedIn account issue |
| 5 | Invalid arguments |
| 6 | Rate limited |
| 7 | Network error |
| 8 | Workflow timeout (workflowId returned for recovery) |

## Important Notes

- **Sequential execution.** Linked API executes all workflows sequentially per account. You can send multiple requests, but they queue and run one at a time. This mirrors natural LinkedIn user behavior.
- **Not instant.** Simple operations (fetch a profile) take ~10-20 seconds. Complex operations (search with filters) can take longer. This is because a real cloud browser navigates LinkedIn on your behalf.
- **Timestamps in UTC.** All dates and times returned by the API are in UTC.
- **URL normalization.** All LinkedIn URLs in responses are normalized to `https://www.linkedin.com/...` format without trailing slashes.
- **Null fields.** Fields that are unavailable are returned as `null` or `[]`, not omitted.
- **Action limits.** Configurable per-account action limits on the [platform](https://app.linkedapi.io) prevent LinkedIn policy violations. When a limit is reached, you get a `limitExceeded` error.

See [Core Concepts](https://linkedapi.io/docs/core-concepts) for more details.

## For AI Agents

This CLI is designed for AI agent consumption:

- `--json` flag gives structured output parseable with `jq`
- Non-TTY stdout auto-switches to JSON
- `--quiet` suppresses all stderr noise
- `--fields` reduces output to only needed data
- Exit code 0 always means "API call succeeded" – parse `success` field for action outcome
- Non-zero exits = infrastructure errors (auth, network, etc.)

Example agent usage:

```bash
# Set up authentication
linkedin setup --linked-api-token=xxx --identification-token=yyy

# Fetch just name and headline
linkedin person fetch https://www.linkedin.com/in/john-doe --json --fields name,headline -q

# Pipe to jq
linkedin person search --term "engineer" --json -q | jq '.data[].name'
```

## Links

- [Linked API Documentation](https://linkedapi.io/docs)
- [Getting Started](https://linkedapi.io/docs/getting-started)
- [Safety & Security](https://linkedapi.io/safety)
- [Node.js SDK](https://www.npmjs.com/package/linkedapi-node)

## License

MIT
