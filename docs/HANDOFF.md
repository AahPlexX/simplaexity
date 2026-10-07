# Handoff

This document assumes no prior conversation context.

1. Read `PRD.md` for product scope and stable feature IDs.
2. Read `TODO.md` for exact execution state and unchecked work.
3. Read `docs/STATUS.md` for the current gate and immediate next action.
4. Read `docs/ARCHITECTURE.md` and `docs/DECISIONS.md` before changing stack, protocol, persistence, or authority boundaries.
5. Read `docs/superpowers/specs/2026-10-06-simplaexity-foundation-design.md` and `docs/superpowers/plans/2026-10-06-controller-foundation.md` for the foundation design/plan.
6. Install only from the committed dependency graph with `pnpm install --frozen-lockfile`.
7. Run `pnpm typecheck` and `pnpm test` before claiming any feature complete; the exact revision used for a completion claim must have green CI evidence.

Non-negotiable invariants: workers do not approve their own completion; unavailable verification is not pass; changed prerequisites stale affected descendants; expired or superseded leases cannot complete or fail work; uncertain external writes require reconciliation; documentation changes with behavior.
