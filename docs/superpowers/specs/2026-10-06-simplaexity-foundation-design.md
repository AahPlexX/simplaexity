# Simplaexity Foundation Design

## Objective

Build the smallest executable foundation that can enforce dependency gates and evidence freshness independently of an AI worker. The first qualified profile is single-repository TypeScript web applications with bounded changes and controlled repository delivery.

## Architecture

`user outcome -> durable RunController -> dependency graph -> execution lease -> worker candidate -> independent verifier -> evidence receipt -> controlled delivery`

The worker may claim eligible nodes and report failure, but cannot issue the evidence that verifies its own work. Controller policy is transport-independent. MCP is an adapter, not the source of truth.

## Foundation invariants

- Validate the dependency graph before execution.
- Only ready nodes may be claimed; an expired lease may be superseded.
- Only the current lease may mutate a running node.
- Verification requires every declared acceptance check exactly once, all passing, all bound to the candidate revision.
- Nodes with zero acceptance checks are invalid.
- Invalidating a prerequisite stales every affected descendant and clears obsolete leases/evidence.
- Missing or unavailable evidence never becomes pass.
- Run state survives restart outside chat/session context.
- Worker-facing MCP tools cannot invoke verification authority.

## Scope boundary

Foundation includes controller, file persistence, worker-safe MCP stdio adapter, tests, CI, and governed documentation. It excludes production database migrations, real payment execution, arbitrary infrastructure administration, and autonomous publishing.
