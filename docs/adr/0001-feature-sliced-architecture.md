# ADR 0001: Feature-sliced layers with enforced import boundaries

- Status: accepted
- Date: 2026-11-06

## Context

Sprint planning touches three kinds of code: domain rules (capacity, dependency ordering), data access
(load and save the workspace) and UI. In a typical `components/` + `hooks/` layout these blur quickly. A
form ends up importing the planner, the planner imports a formatting helper from a page, and nothing
can be moved without breaking something else.

## Decision

Organise `src/` into Feature-Sliced Design layers. Each layer may import only from layers below it:

```
app → pages → widgets → features → entities → shared
```

- **shared**: framework-agnostic building blocks (UI kit, design tokens, typed API client, utilities)
- **entities**: business nouns (member, sprint, work item) with their query/mutation hooks
- **features**: user actions (plan the sprint, edit a member, toggle theme)
- **widgets**: composed blocks (capacity chart, app shell)
- **pages**: route screens; **app**: providers, router, query client

Every slice exposes a public `index.ts`. Rules are enforced in ESLint, not by convention:

- `eslint-plugin-boundaries` rejects upward or sideways imports between layers
- `no-restricted-imports` rejects deep imports that bypass a slice's public index

## Consequences

- A boundary violation fails `npm run lint` and therefore CI.
- The planner (`features/plan-sprint/model`) is a pure function with no React or storage imports, so it
  is unit-tested in isolation and could move to a server unchanged.
- Some small duplication is accepted. For example, two pages each compose their own table instead of
  sharing a page-level component.
