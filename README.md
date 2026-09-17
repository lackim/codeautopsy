# codeautopsy

Post-mortem analysis of dead GitHub repos. Find out if an open-source project is alive, declining, or dead — and why.

[Website](https://lackim.github.io/codeautopsy/) · [npm](https://www.npmjs.com/package/codeautopsy) · [Privacy](https://lackim.github.io/codeautopsy/privacy/) · [Terms](https://lackim.github.io/codeautopsy/terms/)

## Requirements

- Node.js 24 or newer
- [GitHub CLI](https://cli.github.com/) (`gh`)
- An authenticated GitHub CLI session

Check which GitHub account and scopes are currently active before running an analysis:

```bash
gh auth status
```

If needed, authenticate with `gh auth login`. codeautopsy uses the active GitHub CLI
credentials and therefore inherits their repository access. Analysis runs locally;
repository data is not sent to a codeautopsy service.

## Quick Start

```bash
npx codeautopsy atom/atom
```

## Installation

```bash
npm install -g codeautopsy
```

## Usage

```bash
# Analyze a GitHub repository
codeautopsy <owner/repo>

# Full URL also works
codeautopsy https://github.com/atom/atom

# Generate a shareable death certificate image (PNG)
codeautopsy atom/atom --share

# Get raw JSON output
codeautopsy atom/atom --json
```

## What It Analyzes

codeautopsy examines multiple health signals to determine if a project is alive or dead:

| Signal | Severity |
|--------|----------|
| No commits in 1+ year | Critical |
| Repository archived | Critical |
| Activity declined 50%+ | Critical |
| 20+ unanswered issues | Critical |
| Oldest unanswered issue 1+ year | Critical |
| No commits in 6+ months | Warning |
| Bus factor 1 (80%+ commits from one person) | Warning |
| Activity declined 25%+ | Warning |
| No release in 1+ year | Warning |
| Declining commit trend | Warning |

## Health Score

Each repository gets a health score from 0 to 100:

- **80-100** — Alive
- **50-79** — Declining
- **25-49** — On life support
- **0-24** — Dead

## Cause of Death

Based on the signals detected, codeautopsy determines the cause:

- **Archived by owner** — Repository was explicitly archived
- **Sole maintainer burnout** — Bus factor of 1 with critical signals
- **Gradual abandonment** — Significant activity decline
- **Maintainer disappeared** — No commits + unanswered issues
- **Development ceased** — No commits for extended period
- **Slow decline** — Multiple warning signals
- **Still breathing** — No significant signals detected

## Share

Use `--share` to generate a PNG death certificate card, perfect for sharing on X/LinkedIn:

```bash
codeautopsy atom/atom --share
# → Saves codeautopsy-atom-atom.png
```

## Built with

[shipcli 0.5](https://github.com/lackim/shipcli) — CLI framework, typed project configuration, packaging, privacy-friendly legal pages, landing page, and share-card generation.

## Development

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check
```

The project is an external reference implementation for shipcli. Its product logic remains independent while CI verifies that a real consumer can build and package against the current shipcli release.

## License

MIT
