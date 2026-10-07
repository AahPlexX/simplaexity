# Changelog

## 2026-10-06

### Added
- Initialized repository and isolated controller-foundation branch.
- Added governed `PRD.md` and `TODO.md` documentation with stable feature IDs and evidence-based completion states.
- Added foundation design, implementation plan, architecture, decisions, status, documentation standard, and cold-start handoff documents.
- Added RED tests for graph validation, dependency gating, lease fencing, evidence validity, descendant invalidation, durable state, and worker-safe MCP exposure.
- Recorded RED GitHub Actions evidence: dependencies installed successfully and typecheck failed on deliberately absent production modules.
- Implemented the minimal `RunController`, atomic file run store, worker-safe MCP adapter, and stdio entry point for the GREEN phase.
