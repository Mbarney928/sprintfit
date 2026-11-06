# ADR 0002: A typed API interface with a localStorage adapter behind it

- Status: accepted
- Date: 2026-11-06

## Context

The demo has to run on GitHub Pages with no backend, no accounts and no API keys. A real product
would later talk to a server. If components call `localStorage` directly, that later move becomes a
rewrite.

## Decision

- Components never touch storage. They call TanStack Query hooks in `entities/*`.
- Those hooks call a `SprintApi` interface (`shared/api/client.ts`) through React context.
- The only implementation today is `createLocalApi`, which behaves like a remote service:
  - it is async, with configurable latency
  - it serializes writes through a queue
  - it validates every input with zod and rejects with a typed `ApiError` carrying field errors
- Stored data is versioned (`WORKSPACE_VERSION`) and upgraded on load through a migrations map.
- Unreadable data surfaces as a `corrupt_storage` error. The UI then offers a reset instead of crashing.

## Consequences

- Swapping in an HTTP implementation means writing one adapter. Hooks, cache keys and UI stay as they are.
- Tests inject the same adapter, so integration tests exercise the real validation and persistence path.
- Server state lives in TanStack Query (`staleTime: Infinity`; mutations invalidate). Zustand holds only
  client state, here the theme preference. This keeps the two kinds of state from mixing.
