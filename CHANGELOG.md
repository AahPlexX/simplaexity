# Changelog

## 2026-10-07

### Added
- Added a regression contract proving an expired execution lease cannot verify or fail a node even before another worker supersedes it.
- Added a concurrent-mutation regression proving parallel run mutations inside one controller process preserve both state updates.
- Added `src/run-service.ts` as the single-process serialization boundary for run reads and read-modify-write mutations.
- Committed the byte-exact pnpm-generated project lockfile for deterministic dependency installation.

### Changed
- Centralized execution-lease expiry enforcement in the controller lease guard and supplied the current timestamp from the worker failure path.
- Routed worker-facing MCP state access through `RunService` so parallel tool calls cannot lose file-backed run updates inside one controller process.
- Switched CI installation to `pnpm install --frozen-lockfile`.
- Pinned third-party GitHub Actions to full commit SHAs for reproducible workflow execution.
- Formalized the governed PRD/TODO documentation schema and refreshed architecture, decisions, status, and cold-start handoff records.

### Verified
- GitHub Actions run `37555359325` passed strict typecheck and 14/14 tests on revision `337c44af2402a4536308e8e6addfc7cc6106479f` after lease-expiry hardening.
- GitHub Actions run `37667444174` passed on exact revision `ea0692174b80b2c75e30e71a63c1f5dc140b44d1` with the byte-exact generated lockfile, `pnpm install --frozen-lockfile`, pnpm supply-chain policy verification for 26 lockfile entries, strict typecheck, and 14/14 tests.
- GitHub Actions run `37668477139` passed on revision `8dc253a22a0e5f14b15784bbe9c3557d8347eec7` after concurrency hardening: frozen install and supply-chain checks passed, strict typecheck passed, and 15/15 tests passed including concurrent mutation preservation.
- FND-001 through FND-005 satisfy their governed executable-evidence completion rule; FND-006 and FND-007 remain open project blockers before autonomous publishing.

## 2026-10-06

### Added
- Initialized repository and isolated controller-foundation branch.
- Added governed `PRD.md` and `TODO.md` documentation with stable feature IDs and evidence-based completion states.
- Added foundation design, implementation plan, architecture, decisions, status, documentation standard, and cold-start handoff documents.
- Added RED tests for graph validation, dependency gating, lease fencing, evidence validity, descendant invalidation, durable state, and worker-safe MCP exposure.
- Recorded RED GitHub Actions evidence: dependencies installed successfully and typecheck failed on deliberately absent production modules.
- Implemented the minimal `RunController`, atomic file run store, worker-safe MCP adapter, and stdio entry point for the GREEN phase.
