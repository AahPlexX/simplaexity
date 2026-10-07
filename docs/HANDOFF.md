# Handoff

This document assumes no prior conversation context.

1. Read `PRD.md` for product scope and stable feature IDs.
2. Read `TODO.md` for exact execution state and unchecked work.
3. Read `docs/STATUS.md` for the current gate and immediate next action.
4. Read `docs/ARCHITECTURE.md` and `docs/DECISIONS.md` before changing stack, protocol, persistence, or authority boundaries.
5. Read `docs/superpowers/specs/2026-10-06-simplaexity-foundation-design.md` and `docs/superpowers/plans/2026-10-06-controller-foundation.md` for the foundation design/plan.
6. Run `pnpm typecheck` and `pnpm test` after dependencies exist and before claiming any feature complete.

Non-negotiable invariants: workers do not approve their own completion; unavailable verification is not pass; changed prerequisites stale affected descendants; stale leases cannot complete newer attempts; uncertain external writes require reconciliation; documentation changes with behavior.
