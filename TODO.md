# TODO: Simplaexity (`simplaexity`)

**Status:** In Progress  
**Current Phase:** Controller Foundation — Verified / Integration Pending  
**Architecture & Engine:** Node.js 24 LTS + TypeScript 7 + official MCP TypeScript SDK v2  
**Last Updated:** 2026-10-07

**Dependencies Used:**
- [x] `@modelcontextprotocol/server@2.3.1`
- [x] `zod@4.6.5`
- [x] `typescript@7.0.2`
- [x] `@types/node@24.19.1`
- [x] `pnpm@12.10.1`

**Current Verification Baseline:** revision `ea0692174b80b2c75e30e71a63c1f5dc140b44d1`, GitHub Actions run `37667444174` — frozen install passed, pnpm supply-chain policy verification passed, strict TypeScript passed, 14/14 tests passed.

---

## Core Feature Execution Pipeline

- [x] **Dependency-Gated Run Controller** `{id: 'FND-001'}` — `Complete`
  - [x] **Purpose:** Define graph validation and dependency-gated node readiness.
  - [x] **Inputs / Parameters:** Define project/run/revision, node IDs, dependencies, and acceptance checks.
  - [x] **Dependencies Touched:** Node.js standard library only.
  - [x] **Technical Notes & Edge Cases:** Missing dependency, cycle, duplicate ID, and zero-check cases covered by tests.
  - [x] **Implementation Details:** Controller state machine implemented in `src/controller.ts`.
  - [x] **Verification & State Sign-off:** Verified by run `37667444174`.

- [x] **Fenced Execution Leases** `{id: 'FND-002'}` — `Complete`
  - [x] **Purpose:** Prevent stale, expired, or superseded workers from completing work outside their execution lease.
  - [x] **Inputs / Parameters:** node ID, worker ID, current time, TTL.
  - [x] **Dependencies Touched:** Node.js `crypto.randomUUID`.
  - [x] **Technical Notes & Edge Cases:** Expired lease reclaim, direct post-expiry rejection, and superseded-lease rejection are regression-covered.
  - [x] **Implementation Details:** Lease issuance, attempt fencing, and expiry enforcement are centralized in the controller lease guard; MCP failure reporting supplies the current timestamp.
  - [x] **Verification & State Sign-off:** Verified by run `37667444174`.

- [x] **Evidence-Bound Completion and Invalidation** `{id: 'FND-003'}` — `Complete`
  - [x] **Purpose:** Require revision-bound acceptance evidence and stale affected descendants after upstream changes.
  - [x] **Inputs / Parameters:** candidate revision, receipts, invalidation reason.
  - [x] **Dependencies Touched:** Controller state machine.
  - [x] **Technical Notes & Edge Cases:** Incomplete, failed, and cross-revision evidence handled fail-closed; descendant invalidation regression-covered.
  - [x] **Implementation Details:** Evidence validation and descendant invalidation implemented in `src/controller.ts`.
  - [x] **Verification & State Sign-off:** Verified by run `37667444174`.

- [x] **Durable Run State** `{id: 'FND-004'}` — `Complete`
  - [x] **Purpose:** Persist run state independently of chat/session lifetime.
  - [x] **Inputs / Parameters:** run snapshot and run ID.
  - [x] **Dependencies Touched:** Node.js filesystem/path/crypto.
  - [x] **Technical Notes & Edge Cases:** Atomic replacement, restart restoration, missing-run handling, and run-ID path containment are covered.
  - [x] **Implementation Details:** File store implemented in `src/store.ts`.
  - [x] **Verification & State Sign-off:** Verified by run `37667444174`.

- [x] **Worker-Safe MCP Surface** `{id: 'FND-005'}` — `Complete`
  - [x] **Purpose:** Expose bounded controller operations without worker self-approval.
  - [x] **Inputs / Parameters:** create/read/claim/fail/invalidate tool schemas.
  - [x] **Dependencies Touched:** MCP SDK and Zod.
  - [x] **Technical Notes & Edge Cases:** Public tool list explicitly excludes `verify_node`.
  - [x] **Implementation Details:** MCP tools and stdio entry point implemented.
  - [x] **Verification & State Sign-off:** Verified by run `37667444174`.

- [ ] **Trusted Verification Boundary** `{id: 'FND-006'}` — `Planned`
  - [ ] **Purpose:** Add a separately trusted evidence-submission authority.
  - [ ] **Inputs / Parameters:** candidate identity, immutable acceptance definitions, verifier receipts.
  - [ ] **Dependencies Touched:** Controller evidence model and trusted adapter boundary.
  - [ ] **Technical Notes & Edge Cases:** Preserve provenance; prevent worker self-verification or weakening acceptance requirements.
  - [ ] **Implementation Details:** Define verifier contract and persistence semantics before exposing any trusted submission path.
  - [ ] **Verification & State Sign-off:** Require executable authority-separation tests before `Complete`.

- [ ] **Controller Failure-Injection Qualification** `{id: 'FND-007'}` — `Planned`
  - [ ] **Purpose:** Qualify fail-safe behavior across the documented controller failure register.
  - [ ] **Inputs / Parameters:** deterministic failure scenarios and expected state transitions.
  - [ ] **Dependencies Touched:** Controller, store, verifier, delivery adapters.
  - [ ] **Technical Notes & Edge Cases:** Safe blocked/reconciled outcomes are valid; false success is prohibited.
  - [ ] **Implementation Details:** Convert documented failure modes into executable qualification cases.
  - [ ] **Verification & State Sign-off:** Require every supported scenario to produce its expected state transition.

---

## Controller Foundation Integration Checklist

- [x] Commit byte-exact `pnpm-lock.yaml` generated by the verified dependency graph.
- [x] CI uses `pnpm install --frozen-lockfile`.
- [x] Third-party GitHub Actions are pinned to full commit SHAs.
- [x] `pnpm typecheck` passes with zero TypeScript errors on revision `ea0692174b80b2c75e30e71a63c1f5dc140b44d1`.
- [x] `pnpm test` passes 14/14 with zero failures on the same revision.
- [x] GitHub Actions run `37667444174` is green on that exact revision.
- [x] FND-001 through FND-005 have executable verification evidence and are signed off `Complete`.
- [ ] Final documentation-only closeout revision passes the same CI gate.
- [ ] Integrate the verified controller-foundation branch into `main` through the repository integration workflow.

## Project Completion Checklist

- [ ] FND-006 trusted verification boundary is complete and independently verified.
- [ ] FND-007 controller failure-injection qualification is complete.
- [ ] Autonomous publishing remains disabled until the trusted verifier and failure qualification gates are complete.
- [ ] Flip overall project status to `Complete` only after all mandatory features and final integration verification are complete.
