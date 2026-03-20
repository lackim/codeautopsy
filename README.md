# codeautopsy

Post-mortem analysis of dead GitHub repos. Find out if an open-source project is alive, declining, or dead — and why.

## Quick Start

```bash
npx codeautopsy atom/atom
```

## Installation

```bash
npm install -g codeautopsy
```

Requires [GitHub CLI](https://cli.github.com/) (`gh`) to be installed and authenticated:

```bash
gh auth login
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

[shipcli](https://github.com/lackim/shipcli) — CLI-as-a-Product toolkit

## License

MIT
