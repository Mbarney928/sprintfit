# Security policy

## Reporting a vulnerability

Please report vulnerabilities privately using GitHub's
[private vulnerability reporting](https://github.com/Mbarney928/sprintfit/security/advisories/new).
Do not open a public issue. You can expect an acknowledgement within a few days.

## Scope and data

- sprintfit is a static, client-only app. It has no backend, accounts, cookies or API keys.
- All data in this repository and in the demo is **synthetic**: the team members, sprint and
  backlog are fictional.
- User edits are stored only in the visitor's own browser (`localStorage`) and never leave it.

## Measures in place

- A strict Content Security Policy (`script-src 'self'`) and no `dangerouslySetInnerHTML`; this is enforced by lint.
- Every input is validated with zod, both at the form and again at the API boundary.
- gitleaks runs as a pre-commit hook and in CI over full history.
- `npm audit` runs in CI: production dependencies must have no known vulnerabilities, and dev dependencies none rated high or above.
- Dependabot keeps npm packages and GitHub Actions up to date.
- Workflows use read-only default permissions, actions pinned to full commit SHAs, and no repository secrets.
