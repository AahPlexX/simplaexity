# Changelog

## 2026-10-07

### Added
- Added a regression contract proving an expired execution lease cannot verify or fail a node even before another worker supersedes it.
- Committed the exact pnpm-generated project lockfile for deterministic dependency installation.

### Changed
- Centralized execution-lease expiry enforcement in the controller lease guard and supplied the current timestamp from the worker failure path.
- Switched CI installation to `pnpm install --frozen-lockfile`.
- Pinned third-party GitHub Actions to full commit SHAs for reproducible workflow execution.
- Refreshed governed PRD, TODO, status, and cold-start handoff documentation for the controller-foundation closeout gate.

### Verified
- GitHub Actions run `37555359325` passed strict typecheck and 14/14 tests on revision `337c44af2402a4536308e8e6addfc7cc6106479f` before reproducibility closeout changes.

## 2026-10-06

### Added
- Initialized repository and isolated controller-foundation branch.
- Added governed `PRD.md` and `TODO.md` documentation with stable feature IDs and evidence-based completion states.
- Added foundation design, implementation plan, architecture, decisions, status, documentation standard, and cold-start handoff documents.
- Added RED tests for graph validation, dependency gating, lease fencing, evidence validity, descendant invalidation, durable state, and worker-safe MCP exposure.
- Recorded RED GitHub Actions evidence: dependencies installed successfully and typecheck failed on deliberately absent production modules.
- Implemented the minimal `RunController`, atomic file run store, worker-safe MCP adapter, and stdio entry point for the GREEN phase.
