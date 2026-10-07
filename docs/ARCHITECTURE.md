# Architecture

Simplaexity is an evidence-gated execution controller. Replaceable AI workers may inspect and produce bounded candidate work, but controller state determines what is eligible and a separate verifier authority determines whether declared acceptance checks have evidence.

Foundation topology:

`user outcome -> serialized durable controller service -> validated dependency graph -> current unexpired execution lease -> worker candidate -> trusted verifier boundary -> evidence receipt -> controlled delivery boundary`

`src/controller.ts` owns graph validation, node state, lease fencing, evidence checks, and invalidation. A worker may mutate a running node only while its lease is both current and unexpired; expiry fences the attempt immediately even before a replacement worker claims the node.

`src/run-service.ts` is the single-process coordination boundary. It serializes run reads and read-modify-write mutations so parallel MCP tool calls cannot independently load the same snapshot and overwrite each other's updates. `src/store.ts` persists run snapshots by atomic file replacement. `src/server.ts` exposes worker-safe MCP tools and delegates state access through `RunService`; it intentionally does not expose `verify_node`. `src/index.ts` uses the SDK's `serveStdio` factory entry so one server implementation can serve modern 2026-07-28 and supported legacy-era openings.

The file store remains intentionally single-controller-process only. Migration trigger: before multiple controller processes, replicas, or other concurrent writers are enabled, replace process-local serialization plus file replacement with transactional shared storage and preserve fencing/compare-and-swap semantics.

Build reproducibility is part of the execution boundary: dependencies are exact-versioned, the generated pnpm lockfile is committed byte-for-byte, CI installs with `--frozen-lockfile`, and external GitHub Actions are pinned to immutable commit SHAs.
