# Architecture

Simplaexity is an evidence-gated execution controller. Replaceable AI workers may inspect and produce bounded candidate work, but controller state determines what is eligible and a separate verifier authority determines whether declared acceptance checks have evidence.

Foundation topology:

`user outcome -> durable controller -> validated dependency graph -> execution lease -> worker candidate -> trusted verifier boundary -> evidence receipt -> controlled delivery boundary`

`src/controller.ts` owns graph validation, node state, lease fencing, evidence checks, and invalidation. `src/store.ts` persists run snapshots by atomic file replacement. `src/server.ts` exposes worker-safe MCP tools; it intentionally does not expose `verify_node`. `src/index.ts` uses the SDK's `serveStdio` factory entry so one server implementation can serve modern 2026-07-28 and supported legacy-era openings.

The file store is intentionally single-controller-writer only. Migration trigger: before multiple controller replicas or concurrent writers are enabled, replace it with transactional shared storage and preserve fencing semantics.
