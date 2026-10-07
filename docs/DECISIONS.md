# Decisions

## 2026-10-07 — Reproducible dependency and CI execution

**Decision:** Commit the byte-exact pnpm-generated lockfile, install with `pnpm install --frozen-lockfile` in CI, and pin third-party GitHub Actions by full commit SHA while retaining the human-readable release tag as a comment.

**Rationale:** The frozen install makes package-manifest/lockfile drift fail closed. Full action SHAs prevent mutable action tags from silently changing workflow implementation. The lockfile must be preserved exactly as generated because pnpm 12 records both package-manager and project dependency state.

**Verification:** GitHub Actions run `37667444174` on revision `ea0692174b80b2c75e30e71a63c1f5dc140b44d1` passed frozen installation, pnpm supply-chain policy verification for 26 lockfile entries, strict typecheck, and 14/14 tests.

## 2026-10-06 — Governed documentation

**Decision:** `PRD.md` is functional scope, `TODO.md` is execution state, and the supporting docs defined in `docs/DOCUMENTATION_STANDARD.md` must stay synchronized with behavior-changing commits.

**Migration trigger:** Replace only if a later machine-readable documentation system provides equivalent stable IDs, status semantics, and cold-start handoff quality.

## 2026-10-06 — Runtime and dependencies

**Decision:** Node.js 24.21.0 LTS, pnpm 12.10.1, TypeScript 7.0.2, `@modelcontextprotocol/server` 2.3.1, Zod 4.6.5, and `@types/node` 24.19.1. Versions are exact.

**Rationale:** Current stable releases verified against official/current package documentation on 2026-10-06. The MCP SDK v2 is the stable line implementing the 2026-07-28 specification.

## 2026-10-06 — No worker-facing verification authority

**Decision:** The worker-facing MCP surface must not expose `verify_node` or equivalent self-approval authority.

**Rationale:** Implementation workers cannot be the authority that declares their own acceptance evidence sufficient.

## 2026-10-06 — File persistence first

**Decision:** Use atomic JSON file replacement with one controller writer process for the foundation.

**Migration trigger:** Before multi-process/multi-replica controller writes, move to transactional shared storage with compare-and-swap/fencing semantics.
