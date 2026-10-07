# TODO: Simplaexity (`simplaexity`)

**Status:** In Progress  
**Current Phase:** Controller Foundation  
**Architecture & Engine:** Node.js 24 LTS + TypeScript 7 + official MCP TypeScript SDK v2  
**Last Updated:** 2026-10-06

**Dependencies Used:**
- [ ] `@modelcontextprotocol/server@2.3.1` — install/lock verification pending
- [ ] `zod@4.6.5` — install/lock verification pending
- [ ] `typescript@7.0.2` — build verification pending
- [ ] `@types/node@24.19.1` — build verification pending
- [ ] `pnpm@12.10.1` — CI verification pending

---

## Core Feature Execution Pipeline

- [ ] **Dependency-Gated Run Controller** `{id: 'FND-001'}` — `In Progress`
  - [x] **Purpose:** Define graph validation and dependency-gated node readiness.
  - [x] **Inputs / Parameters:** Define project/run/revision, node IDs, dependencies, and acceptance checks.
  - [x] **Dependencies Touched:** Node.js standard library only.
  - [x] **Technical Notes & Edge Cases:** Missing dependency, cycle, duplicate ID, and zero-check cases specified in tests.
  - [ ] **Implementation Details:** Implement controller state machine.
  - [ ] **Verification & State Sign-off:** CI must pass controller tests before status becomes `Complete`.

- [ ] **Fenced Execution Leases** `{id: 'FND-002'}` — `In Progress`
  - [x] **Purpose:** Prevent stale workers from completing newer attempts.
  - [x] **Inputs / Parameters:** node ID, worker ID, current time, TTL.
  - [x] **Technical Notes & Edge Cases:** Expired lease reclaim and stale-lease rejection specified in tests.
  - [ ] **Implementation Details:** Implement lease issuance and attempt fencing.
  - [ ] **Verification & State Sign-off:** CI stale-lease test must pass.

- [ ] **Evidence-Bound Completion and Invalidation** `{id: 'FND-003'}` — `In Progress`
  - [x] **Purpose:** Require revision-bound acceptance evidence and stale affected descendants after upstream changes.
  - [x] **Inputs / Parameters:** candidate revision, receipts, invalidation reason.
  - [x] **Technical Notes & Edge Cases:** Incomplete, failed, and cross-revision evidence specified in tests.
  - [ ] **Implementation Details:** Implement evidence validation and descendant invalidation.
  - [ ] **Verification & State Sign-off:** CI evidence/invalidation tests must pass.

- [ ] **Durable Run State** `{id: 'FND-004'}` — `In Progress`
  - [x] **Purpose:** Persist run state independently of chat/session lifetime.
  - [x] **Inputs / Parameters:** run snapshot and run ID.
  - [x] **Technical Notes & Edge Cases:** Restart recovery and path-escape case specified in tests.
  - [ ] **Implementation Details:** Implement atomic JSON store.
  - [ ] **Verification & State Sign-off:** CI store tests must pass.

- [ ] **Worker-Safe MCP Surface** `{id: 'FND-005'}` — `Planned`
  - [x] **Purpose:** Expose bounded controller operations without worker self-approval.
  - [x] **Inputs / Parameters:** create/read/claim/fail/invalidate tool schemas.
  - [x] **Dependencies Touched:** MCP SDK and Zod.
  - [x] **Technical Notes & Edge Cases:** Public tool list explicitly excludes `verify_node`.
  - [ ] **Implementation Details:** Register tools and stdio entry point.
  - [ ] **Verification & State Sign-off:** MCP surface tests and CI must pass.

- [ ] **Trusted Verification Boundary** `{id: 'FND-006'}` — `Planned`
  - [ ] Implement separately trusted evidence submission path.
  - [ ] Bind receipts to candidate identity and immutable acceptance definitions.
  - [ ] Prove worker-facing tools cannot reach this authority.

- [ ] **Controller Failure-Injection Qualification** `{id: 'FND-007'}` — `Planned`
  - [ ] Convert the documented controller failure register into executable qualification cases.
  - [ ] Require correct blocked/reconciled/verified transitions rather than blanket success.

---

## Final Assembly & Verification Checklist

- [ ] Install dependencies and commit `pnpm-lock.yaml`.
- [ ] `pnpm typecheck` passes with zero TypeScript errors.
- [ ] `pnpm test` passes with zero failing tests.
- [ ] GitHub Actions CI is green on the exact branch revision.
- [ ] `PRD.md`, `TODO.md`, `docs/STATUS.md`, `docs/HANDOFF.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, and `CHANGELOG.md` agree with implementation state.
- [ ] Final controller qualification is complete before autonomous publishing is enabled.
- [ ] Flip overall status to `Complete` only after all mandatory features and verification gates are complete.
