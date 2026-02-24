# linkedin-cli

AI-agent-friendly CLI for LinkedIn automation via [Linked API](https://linkedapi.io).

Give your AI agent full LinkedIn capabilities: send messages, fetch profiles, search people and companies, manage connections, create posts, react, comment – all through simple CLI commands with structured JSON output. Built for OpenClaw, Claude Code, Cursor, Codex, and any AI agent that can execute shell commands.

Under the hood, [Linked API](https://linkedapi.io) runs a dedicated cloud browser instance for each connected LinkedIn account. When your agent runs a command, the CLI sends the request to Linked API's infrastructure, where an isolated browser with a residential IP performs the action on LinkedIn – simulating human-like mouse movements, keyboard input, and natural browsing patterns. No local browsers, no proxies, no Selenium, no infrastructure to manage. [Learn more about safety](https://linkedapi.io/safety).

## Install

```bash
npm install -g @linkedapi/linkedin-cli
```

## Quick Start

```bash
# 1. Save your tokens (get them at app.linkedapi.io)
linkedin setup

# 2. Fetch a profile
linkedin person fetch https://www.linkedin.com/in/vprudnikoff --json

# 3. Search for people
linkedin person search --term "revops engineer" --current-companies "Linked API" --json

# 4. Send a message
linkedin message send https://www.linkedin.com/in/vprudnikoff "Hey, loved your latest post!"
```

## Authentication

### Initial setup

```bash
linkedin setup
```

The CLI will ask for your **Linked API Token** and **Identification Token**. Get them at [app.linkedapi.io](https://app.linkedapi.io).

For non-interactive environments (CI, scripts):

```bash
linkedin setup --linked-api-token=xxx --identification-token=yyy
```

| Flag | Description |
|------|-------------|
| `--linked-api-token` | Linked API Token (skips prompt) |
| `--identification-token` | Identification Token (skips prompt) |

### Multiple accounts

Run `linkedin setup` again with different tokens to add more accounts. The last added account becomes active.

```bash
# List all accounts (* marks active)
linkedin account list

# Switch active account
linkedin account switch "Vlad"

# Rename a saved account
linkedin account rename "Vlad" --name "My Work Account"

# Use a specific account for one command
linkedin person fetch https://www.linkedin.com/in/... --account "Vlad"

# Remove active account (auto-switches to next)
linkedin reset

# Remove all accounts
linkedin reset --all
```

## Global Flags

Every command supports these flags:

| Flag | Description |
|------|-------------|
| `--json` | Structured JSON output to stdout |
| `--fields name,url,...` | Select specific fields in output |
| `--quiet` / `-q` | Suppress stderr progress |
| `--no-color` | Disable colors |
| `--account "Name"` | Use a specific account for this command |

---

## Command Reference

### People

#### `person fetch`

Fetch a LinkedIn person profile with optional additional data sections.

```bash
linkedin person fetch <url> [flags]
```

| Arg | Required | Description |
|-----|----------|-------------|
| `url` | yes | LinkedIn profile URL |

| Flag | Type | Description |
|------|------|-------------|
| `--experience` | boolean | Include work experience |
| `--education` | boolean | Include education history |
| `--skills` | boolean | Include skills |
| `--languages` | boolean | Include languages |
| `--posts` | boolean | Include recent posts |
| `--comments` | boolean | Include recent comments |
| `--reactions` | boolean | Include recent reactions |
| `--posts-limit` | integer | Max posts to retrieve (requires `--posts`) |
| `--posts-since` | string | Posts since ISO timestamp (requires `--posts`) |
| `--comments-limit` | integer | Max comments to retrieve (requires `--comments`) |
| `--comments-since` | string | Comments since ISO timestamp (requires `--comments`) |
| `--reactions-limit` | integer | Max reactions to retrieve (requires `--reactions`) |
| `--reactions-since` | string | Reactions since ISO timestamp (requires `--reactions`) |

```bash
# Basic profile info
linkedin person fetch https://www.linkedin.com/in/vprudnikoff

# Full profile with experience and education
linkedin person fetch https://www.linkedin.com/in/vprudnikoff --experience --education --json

# Profile with recent posts (last 5)
linkedin person fetch https://www.linkedin.com/in/vprudnikoff --posts --posts-limit 5

# Everything
linkedin person fetch https://www.linkedin.com/in/vprudnikoff \
  --experience --education --skills --languages \
  --posts --comments --reactions --json
```

#### `person search`

Search for people on LinkedIn with filters.

```bash
linkedin person search [flags]
```

| Flag | Type | Description |
|------|------|-------------|
| `--term` | string | Search keyword or phrase |
| `--limit` | integer | Max results to return |
| `--first-name` | string | Filter by first name |
| `--last-name` | string | Filter by last name |
| `--position` | string | Filter by job position |
| `--locations` | string | Comma-separated locations |
| `--industries` | string | Comma-separated industries |
| `--current-companies` | string | Comma-separated current company names |
| `--previous-companies` | string | Comma-separated previous company names |
| `--schools` | string | Comma-separated school names |

```bash
linkedin person search --term "revops engineer" --locations "San Francisco"
linkedin person search --current-companies "Linked API" --position "Engineer" --json
linkedin person search --schools "MIT" --industries "Software Development" --limit 20 --json
```

---

### Companies

#### `company fetch`

Fetch a LinkedIn company profile with optional employees, decision makers, and posts.

```bash
linkedin company fetch <url> [flags]
```

| Arg | Required | Description |
|-----|----------|-------------|
| `url` | yes | LinkedIn company URL |

| Flag | Type | Description |
|------|------|-------------|
| `--employees` | boolean | Include employee data |
| `--dms` | boolean | Include decision makers |
| `--posts` | boolean | Include company posts |
| `--employees-limit` | integer | Max employees to retrieve (requires `--employees`) |
| `--employees-first-name` | string | Filter employees by first name (requires `--employees`) |
| `--employees-last-name` | string | Filter employees by last name (requires `--employees`) |
| `--employees-position` | string | Filter employees by position (requires `--employees`) |
| `--employees-locations` | string | Filter employees by locations, comma-separated (requires `--employees`) |
| `--employees-industries` | string | Filter employees by industries, comma-separated (requires `--employees`) |
| `--employees-schools` | string | Filter employees by schools, comma-separated (requires `--employees`) |
| `--dms-limit` | integer | Max decision makers to retrieve (requires `--dms`) |
| `--posts-limit` | integer | Max posts to retrieve (requires `--posts`) |
| `--posts-since` | string | Posts since ISO timestamp (requires `--posts`) |

```bash
# Basic company info
linkedin company fetch https://www.linkedin.com/company/flutterwtf

# Company with employees and decision makers
linkedin company fetch https://www.linkedin.com/company/flutterwtf --employees --dms --json

# Filter employees by position and location
linkedin company fetch https://www.linkedin.com/company/flutterwtf \
  --employees --employees-position "Engineer" --employees-locations "United States"

# Company posts from last month
linkedin company fetch https://www.linkedin.com/company/flutterwtf \
  --posts --posts-since 2024-12-01T00:00:00Z --json
```

#### `company search`

Search for companies on LinkedIn with filters.

```bash
linkedin company search [flags]
```

| Flag | Type | Description |
|------|------|-------------|
| `--term` | string | Search keyword or phrase |
| `--limit` | integer | Max results to return |
| `--sizes` | string | Company sizes, comma-separated (`1-10`, `11-50`, `51-200`, `201-500`, `501-1000`, `1001-5000`, `5001-10000`, `10001+`) |
| `--locations` | string | Comma-separated locations |
| `--industries` | string | Comma-separated industries |

```bash
linkedin company search --term "fintech" --sizes "11-50,51-200" --json
linkedin company search --industries "Software Development" --locations "Berlin" --json
```

---

### Messages

#### `message send`

Send a message to a LinkedIn connection.

```bash
linkedin message send <person-url> <text>
```

| Arg | Required | Description |
|-----|----------|-------------|
| `person-url` | yes | LinkedIn profile URL of the recipient |
| `text` | yes | Message text (up to 1900 characters) |

```bash
linkedin message send https://www.linkedin.com/in/vprudnikoff "Hey, loved your latest post!"
```

#### `message get`

Get conversation messages with a LinkedIn person.

```bash
linkedin message get <person-url> [flags]
```

| Arg | Required | Description |
|-----|----------|-------------|
| `person-url` | yes | LinkedIn profile URL |

| Flag | Type | Description |
|------|------|-------------|
| `--since` | string | Only retrieve messages since this ISO timestamp |

```bash
linkedin message get https://www.linkedin.com/in/vprudnikoff --json
linkedin message get https://www.linkedin.com/in/vprudnikoff --since 2024-01-15T10:30:00Z
```

> **Note:** The first call for a conversation triggers a background sync, which may take longer. Subsequent calls use cached data and are faster.

---

### Connections

#### `connection status`

Check connection status with a LinkedIn person.

```bash
linkedin connection status <url>
```

| Arg | Required | Description |
|-----|----------|-------------|
| `url` | yes | LinkedIn profile URL |

```bash
linkedin connection status https://www.linkedin.com/in/vprudnikoff
```

#### `connection send`

Send a connection request.

```bash
linkedin connection send <url> [flags]
```

| Arg | Required | Description |
|-----|----------|-------------|
| `url` | yes | LinkedIn profile URL |

| Flag | Type | Description |
|------|------|-------------|
| `--note` | string | Personalized note to include with the request |
| `--email` | string | Email address (required by some profiles to connect) |

```bash
linkedin connection send https://www.linkedin.com/in/vprudnikoff
linkedin connection send https://www.linkedin.com/in/vprudnikoff --note "Love to connect!"
linkedin connection send https://www.linkedin.com/in/vprudnikoff --email vlad@example.com
```

#### `connection list`

List your LinkedIn connections with optional filters.

```bash
linkedin connection list [flags]
```

| Flag | Type | Description |
|------|------|-------------|
| `--limit` | integer | Max connections to return |
| `--since` | string | Only connections made since this ISO timestamp |
| `--first-name` | string | Filter by first name |
| `--last-name` | string | Filter by last name |
| `--position` | string | Filter by job position |
| `--locations` | string | Comma-separated locations |
| `--industries` | string | Comma-separated industries |
| `--current-companies` | string | Comma-separated current company names |
| `--previous-companies` | string | Comma-separated previous company names |
| `--schools` | string | Comma-separated school names |

> **Note:** `--since` only works when no filter flags are used.

```bash
linkedin connection list --limit 50 --json
linkedin connection list --current-companies "Linked API" --position "Engineer" --json
linkedin connection list --since 2024-01-01T00:00:00Z --json
```

#### `connection pending`

List pending outgoing connection requests.

```bash
linkedin connection pending
```

```bash
linkedin connection pending --json
```

#### `connection withdraw`

Withdraw a pending connection request.

```bash
linkedin connection withdraw <url> [flags]
```

| Arg | Required | Description |
|-----|----------|-------------|
| `url` | yes | LinkedIn profile URL |

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--unfollow` / `--no-unfollow` | boolean | `true` | Also unfollow the person |

```bash
linkedin connection withdraw https://www.linkedin.com/in/vprudnikoff
linkedin connection withdraw https://www.linkedin.com/in/vprudnikoff --no-unfollow
```

#### `connection remove`

Remove an existing connection.

```bash
linkedin connection remove <url>
```

| Arg | Required | Description |
|-----|----------|-------------|
| `url` | yes | LinkedIn profile URL |

```bash
linkedin connection remove https://www.linkedin.com/in/vprudnikoff
```

---

### Posts

#### `post fetch`

Fetch a LinkedIn post with optional comments and reactions.

```bash
linkedin post fetch <url> [flags]
```

| Arg | Required | Description |
|-----|----------|-------------|
| `url` | yes | LinkedIn post URL |

| Flag | Type | Description |
|------|------|-------------|
| `--comments` | boolean | Include comments |
| `--reactions` | boolean | Include reactions |
| `--comments-limit` | integer | Max comments to retrieve (requires `--comments`) |
| `--comments-sort` | string | Sort order: `mostRelevant` or `mostRecent` (requires `--comments`) |
| `--comments-replies` | boolean | Include replies to comments (requires `--comments`) |
| `--reactions-limit` | integer | Max reactions to retrieve (requires `--reactions`) |

```bash
linkedin post fetch https://www.linkedin.com/posts/vprudnikoff_activity-123

# With comments sorted by most recent, including replies
linkedin post fetch https://www.linkedin.com/posts/vprudnikoff_activity-123 \
  --comments --comments-sort mostRecent --comments-replies --json

# With reactions
linkedin post fetch https://www.linkedin.com/posts/vprudnikoff_activity-123 \
  --comments --reactions --json
```

#### `post create`

Create a LinkedIn post with optional media attachments.

```bash
linkedin post create <text> [flags]
```

| Arg | Required | Description |
|-----|----------|-------------|
| `text` | yes | Post text (up to 3000 characters) |

| Flag | Type | Description |
|------|------|-------------|
| `--company-url` | string | Post on behalf of a company page (requires admin access) |
| `--attachments` | string | Attachments as `url:type` or `url:type:name`. Types: `image`, `video`, `document`. Can be specified multiple times. |

> Attachment limits: up to 9 images, or 1 video, or 1 document. Cannot mix types.

```bash
linkedin post create "Excited to share our latest update!"

# With an image
linkedin post create "Check this out" \
  --attachments "https://example.com/photo.jpg:image"

# With a document
linkedin post create "Our Q4 report" \
  --attachments "https://example.com/report.pdf:document:Q4 Report"

# Post as a company
linkedin post create "Company announcement" \
  --company-url https://www.linkedin.com/company/flutterwtf
```

#### `post react`

React to a LinkedIn post.

```bash
linkedin post react <url> --type <reaction> [flags]
```

| Arg | Required | Description |
|-----|----------|-------------|
| `url` | yes | LinkedIn post URL |

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--type` | string | yes | Reaction type: `like`, `love`, `support`, `celebrate`, `insightful`, `funny` |
| `--company-url` | string | no | React on behalf of a company page |

```bash
linkedin post react https://www.linkedin.com/posts/vprudnikoff_activity-123 --type like
linkedin post react https://www.linkedin.com/posts/vprudnikoff_activity-123 --type celebrate \
  --company-url https://www.linkedin.com/company/flutterwtf
```

#### `post comment`

Comment on a LinkedIn post.

```bash
linkedin post comment <url> <text> [flags]
```

| Arg | Required | Description |
|-----|----------|-------------|
| `url` | yes | LinkedIn post URL |
| `text` | yes | Comment text (up to 1000 characters) |

| Flag | Type | Description |
|------|------|-------------|
| `--company-url` | string | Comment on behalf of a company page |

```bash
linkedin post comment https://www.linkedin.com/posts/vprudnikoff_activity-123 "Great insights!"
linkedin post comment https://www.linkedin.com/posts/vprudnikoff_activity-123 "Well said!" \
  --company-url https://www.linkedin.com/company/flutterwtf
```

---

### Statistics

#### `stats ssi`

Retrieve your LinkedIn Social Selling Index.

```bash
linkedin stats ssi [flags]
```

```bash
linkedin stats ssi --json
```

#### `stats performance`

Retrieve your LinkedIn performance analytics (profile views, post impressions, search appearances).

```bash
linkedin stats performance [flags]
```

```bash
linkedin stats performance --json
```

#### `stats usage`

Retrieve Linked API usage statistics for a date range.

```bash
linkedin stats usage --start <timestamp> --end <timestamp> [flags]
```

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--start` | string | yes | Start date in ISO timestamp |
| `--end` | string | yes | End date in ISO timestamp |

```bash
linkedin stats usage --start 2024-01-01T00:00:00Z --end 2024-01-31T00:00:00Z --json
```

---

### Sales Navigator

Requires a LinkedIn Sales Navigator subscription.

#### `navigator person fetch`

Fetch a person profile via Sales Navigator.

```bash
linkedin navigator person fetch <hashed-url>
```

| Arg | Required | Description |
|-----|----------|-------------|
| `hashed-url` | yes | Hashed LinkedIn profile URL |

```bash
linkedin navigator person fetch https://www.linkedin.com/in/ACwAAA...
```

#### `navigator person search`

Search for people via Sales Navigator with advanced filters.

```bash
linkedin navigator person search [flags]
```

| Flag | Type | Description |
|------|------|-------------|
| `--term` | string | Search keyword or phrase |
| `--limit` | integer | Max results to return |
| `--first-name` | string | Filter by first name |
| `--last-name` | string | Filter by last name |
| `--position` | string | Filter by job position |
| `--locations` | string | Comma-separated locations |
| `--industries` | string | Comma-separated industries |
| `--current-companies` | string | Comma-separated current company names |
| `--previous-companies` | string | Comma-separated previous company names |
| `--schools` | string | Comma-separated school names |
| `--years-of-experience` | string | Comma-separated experience ranges: `lessThanOne`, `oneToTwo`, `threeToFive`, `sixToTen`, `moreThanTen` |

```bash
linkedin navigator person search --term "VP Marketing" --locations "United States"
linkedin navigator person search --years-of-experience "moreThanTen" --position "CEO" --json
```

#### `navigator company fetch`

Fetch a company profile via Sales Navigator with optional employees and decision makers.

```bash
linkedin navigator company fetch <hashed-url> [flags]
```

| Arg | Required | Description |
|-----|----------|-------------|
| `hashed-url` | yes | Hashed LinkedIn company URL |

| Flag | Type | Description |
|------|------|-------------|
| `--employees` | boolean | Include employee data |
| `--dms` | boolean | Include decision makers |
| `--employees-limit` | integer | Max employees to retrieve (requires `--employees`) |
| `--employees-first-name` | string | Filter employees by first name (requires `--employees`) |
| `--employees-last-name` | string | Filter employees by last name (requires `--employees`) |
| `--employees-positions` | string | Filter employees by positions, comma-separated (requires `--employees`) |
| `--employees-locations` | string | Filter employees by locations, comma-separated (requires `--employees`) |
| `--employees-industries` | string | Filter employees by industries, comma-separated (requires `--employees`) |
| `--employees-schools` | string | Filter employees by schools, comma-separated (requires `--employees`) |
| `--employees-years-of-experience` | string | Filter employees by experience ranges, comma-separated (requires `--employees`) |
| `--dms-limit` | integer | Max decision makers to retrieve (requires `--dms`) |

```bash
linkedin navigator company fetch https://www.linkedin.com/sales/company/97ural --employees --dms
linkedin navigator company fetch https://www.linkedin.com/sales/company/97ural \
  --employees --employees-positions "Engineer,Designer" --employees-locations "Europe"
```

#### `navigator company search`

Search for companies via Sales Navigator with advanced filters including revenue.

```bash
linkedin navigator company search [flags]
```

| Flag | Type | Description |
|------|------|-------------|
| `--term` | string | Search keyword or phrase |
| `--limit` | integer | Max results to return |
| `--sizes` | string | Company sizes, comma-separated (`1-10`, `11-50`, `51-200`, `201-500`, `501-1000`, `1001-5000`, `5001-10000`, `10001+`) |
| `--locations` | string | Comma-separated locations |
| `--industries` | string | Comma-separated industries |
| `--revenue-min` | string | Min annual revenue in M USD: `0`, `0.5`, `1`, `2.5`, `5`, `10`, `20`, `50`, `100`, `500`, `1000` |
| `--revenue-max` | string | Max annual revenue in M USD: `0.5`, `1`, `2.5`, `5`, `10`, `20`, `50`, `100`, `500`, `1000`, `1000+` |

```bash
linkedin navigator company search --term "fintech" --sizes "11-50,51-200"
linkedin navigator company search --revenue-min 10 --revenue-max 100 --locations "United States" --json
```

#### `navigator message send`

Send a message via Sales Navigator (InMail).

```bash
linkedin navigator message send <person-url> <text> --subject <subject>
```

| Arg | Required | Description |
|-----|----------|-------------|
| `person-url` | yes | LinkedIn profile URL of the recipient |
| `text` | yes | Message text (up to 1900 characters) |

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--subject` | string | yes | Message subject line (up to 80 characters) |

```bash
linkedin navigator message send https://www.linkedin.com/in/vprudnikoff "Would love to chat about API integrations" --subject "Partnership Opportunity"
```

#### `navigator message get`

Get Sales Navigator conversation messages.

```bash
linkedin navigator message get <person-url> [flags]
```

| Arg | Required | Description |
|-----|----------|-------------|
| `person-url` | yes | LinkedIn profile URL |

| Flag | Type | Description |
|------|------|-------------|
| `--since` | string | Only retrieve messages since this ISO timestamp |

```bash
linkedin navigator message get https://www.linkedin.com/in/vprudnikoff
linkedin navigator message get https://www.linkedin.com/in/vprudnikoff --since 2024-01-15T10:30:00Z
```

---

### Custom Workflows

#### `workflow run`

Execute a custom workflow definition. Accepts JSON from a file or stdin.

```bash
linkedin workflow run [flags]
```

| Flag | Type | Description |
|------|------|-------------|
| `-f` / `--file` | string | Path to workflow JSON file |

```bash
# From file
linkedin workflow run --file workflow.json

# From stdin
cat workflow.json | linkedin workflow run

# Inline
echo '{"actions":[...]}' | linkedin workflow run
```

See [Building Workflows](https://linkedapi.io/docs/building-workflows/) for the workflow JSON schema.

#### `workflow status`

Check status of a running workflow or wait for its completion.

```bash
linkedin workflow status <id> [flags]
```

| Arg | Required | Description |
|-----|----------|-------------|
| `id` | yes | Workflow ID |

| Flag | Type | Description |
|------|------|-------------|
| `--wait` | boolean | Block until the workflow completes |

```bash
# Check current status
linkedin workflow status abc123

# Wait for completion
linkedin workflow status abc123 --wait --json
```

---

### Account Management

#### `account list`

List all configured LinkedIn accounts.

```bash
linkedin account list
```

The active account is marked with `*`.

#### `account switch`

Switch the active LinkedIn account.

```bash
linkedin account switch <name>
```

| Arg | Required | Description |
|-----|----------|-------------|
| `name` | yes | Account name (case-insensitive substring match) |

```bash
linkedin account switch "Vlad"
```

#### `account rename`

Rename a saved LinkedIn account.

```bash
linkedin account rename <name> --name <new-name>
```

| Arg | Required | Description |
|-----|----------|-------------|
| `name` | yes | Current account name (case-insensitive substring match) |

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--name` | string | yes | New name for the account |

```bash
linkedin account rename "Vlad" --name "My Work Account"
```

#### `reset`

Remove stored accounts and tokens.

```bash
linkedin reset [flags]
```

| Flag | Type | Description |
|------|------|-------------|
| `--all` | boolean | Remove all accounts (default: removes only active account) |

```bash
# Remove active account (auto-switches to next)
linkedin reset

# Remove all accounts
linkedin reset --all
```

---

## Output Format

### JSON mode (`--json` or non-TTY stdout)

```json
{"success": true, "data": {"name": "Vlad Prudnikov", "headline": "CEO at Linked API"}}
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
linkedin person fetch https://www.linkedin.com/in/vprudnikoff --json --fields name,headline -q

# Pipe to jq
linkedin person search --term "revops engineer" --json -q | jq '.data[].name'
```

## Links

- [Linked API Documentation](https://linkedapi.io/docs)
- [Safety & Security](https://linkedapi.io/safety)
- [Node.js SDK](https://www.npmjs.com/package/@linkedapi/node)
- [MCP Server](https://www.npmjs.com/package/@linkedapi/mcp)

## Legal

This project is maintained by [Linked API](https://linkedapi.io). The name "linkedin-cli" refers to the platform this tool is designed to work with, not to any affiliation or ownership.

Linked API is not affiliated, associated, authorized, endorsed by, or in any way officially connected with LinkedIn Corporation. "LinkedIn" is a registered trademark of LinkedIn Corporation.

## License

This project is licensed under the MIT – see the [LICENSE](https://github.com/Linked-API/linkedin-cli/blob/main/LICENSE) file for details.
