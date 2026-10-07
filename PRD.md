# PRD: Simplaexity

Documentation schema version: `1.0`

## Planned Functional Features Specification

```yaml
project_identity:
  name: "Simplaexity"
  slug: "simplaexity"
  development_status: "In Progress"
  current_phase: "Controller Foundation"
  last_updated: "2026-10-07"

status_contract:
  allowed_feature_statuses: ["Planned", "In Progress", "Blocked", "Verification Pending", "Complete"]
  completion_rule: "A feature is Complete only when its acceptance criteria have executable evidence against the current implementation."

technical_foundation:
  architecture_and_engine: "Node.js 24 LTS + TypeScript 7 controller; official MCP TypeScript SDK v2; dependency-gated execution with independent verification authority."
  dependencies_used:
    - "@modelcontextprotocol/server@2.3.1"
    - "zod@4.6.5"
    - "typescript@7.0.2"
    - "@types/node@24.19.1"
  package_manager: "pnpm@12.10.1"
  runtime: "Node.js 24.21.0 LTS"
  reproducibility: "Committed byte-exact pnpm lockfile; CI installs with --frozen-lockfile; third-party GitHub Actions are pinned by full commit SHA."
  concurrency_model: "One controller process may receive parallel MCP calls; RunService serializes run reads and read-modify-write mutations so file-backed snapshots do not lose concurrent updates. Multi-process/multi-replica writes remain out of scope."
  verification_baseline: "Revision 8dc253a22a0e5f14b15784bbe9c3557d8347eec7; GitHub Actions run 37668477139; frozen install and pnpm supply-chain policy verification passed; strict typecheck passed; 15/15 tests passed."

core_feature_specifications:
  - name: "Dependency-Gated Run Controller"
    id: "FND-001"
    details:
      purpose: "Validate the work graph and prevent downstream execution until every prerequisite is verified."
      inputs_parameters: "projectId, runId, sourceRevision, node definitions, acceptance-check IDs"
      dependencies_touched: "Node.js standard library only"
      technical_notes_edge_cases: "Reject missing dependencies, cycles, duplicate node IDs, and nodes with zero acceptance checks."
      acceptance_criteria: "Blocked/ready transitions are deterministic and invalid graphs fail closed."
      verification_evidence: "Run 37668477139 on revision 8dc253a22a0e5f14b15784bbe9c3557d8347eec7."
    feature_development_status: "Complete"

  - name: "Fenced Execution Leases"
    id: "FND-002"
    details:
      purpose: "Prevent duplicate, expired, or superseded workers from completing work outside the currently valid execution attempt."
      inputs_parameters: "nodeId, workerId, timestamp, lease TTL"
      dependencies_touched: "Node.js crypto randomUUID"
      technical_notes_edge_cases: "An expired lease is stale immediately, even before replacement; expired leases may be reclaimed into a newer attempt; superseded lease IDs cannot mutate the node."
      acceptance_criteria: "Only the current, unexpired lease may verify or fail a running node."
      verification_evidence: "Run 37668477139 includes passing expired-lease and superseded-lease regression cases."
    feature_development_status: "Complete"

  - name: "Evidence-Bound Completion and Invalidation"
    id: "FND-003"
    details:
      purpose: "Separate implementation claims from controller-owned evidence and invalidate descendants when an upstream fact changes."
      inputs_parameters: "candidate revision, evidence receipts, invalidation reason"
      dependencies_touched: "Controller state machine"
      technical_notes_edge_cases: "Every declared check must appear exactly once, pass, and bind to the same candidate revision; changed prerequisites stale descendants."
      acceptance_criteria: "Missing, failed, duplicate, or cross-revision evidence cannot verify a node."
      verification_evidence: "Run 37668477139 includes passing evidence-fail-closed and descendant-invalidation cases."
    feature_development_status: "Complete"

  - name: "Durable Run State"
    id: "FND-004"
    details:
      purpose: "Keep controller state outside chat/session context so interrupted work can resume without losing concurrent single-process mutations."
      inputs_parameters: "run snapshot and run ID"
      dependencies_touched: "Node.js filesystem/path/crypto; RunService serialization boundary"
      technical_notes_edge_cases: "Atomic temp-file replacement; encoded filenames prevent run IDs from escaping the store directory; process-local serialization prevents parallel MCP read-modify-write operations from overwriting one another. Multi-process writers require transactional shared storage."
      acceptance_criteria: "A saved run reloads unchanged after a new store instance is created, and concurrent mutations inside one controller process preserve both updates."
      verification_evidence: "Run 37668477139 includes passing persistence, restart, missing-run, path-containment, and concurrent-mutation preservation cases."
    feature_development_status: "Complete"

  - name: "Worker-Safe MCP Surface"
    id: "FND-005"
    details:
      purpose: "Expose bounded run operations through the official MCP SDK without giving workers authority to approve their own completion."
      inputs_parameters: "MCP tool inputs for create/read/claim/fail/invalidate"
      dependencies_touched: "@modelcontextprotocol/server, zod, RunService"
      technical_notes_edge_cases: "No public verify_node tool in the worker surface; serveStdio supports modern 2026-07-28 and legacy-era openings; tool operations route through the single-process serialization boundary."
      acceptance_criteria: "Registered public tool list is explicit and omits verification authority; parallel tool calls cannot lose run mutations within one controller process."
      verification_evidence: "Run 37668477139 includes passing public-surface, official-MCP-server-instance, and concurrent-mutation cases."
    feature_development_status: "Complete"

  - name: "Trusted Verification Boundary"
    id: "FND-006"
    details:
      purpose: "Accept evidence from a separately trusted verifier rather than from the implementation worker."
      inputs_parameters: "candidate artifact identity, acceptance-check definitions, verifier receipts"
      dependencies_touched: "Controller evidence model"
      technical_notes_edge_cases: "Must preserve provenance and prevent the implementation worker from weakening required checks."
      acceptance_criteria: "Verifier pathway can submit evidence while the worker-facing pathway cannot."
    feature_development_status: "Planned"

  - name: "Controller Failure-Injection Qualification"
    id: "FND-007"
    details:
      purpose: "Prove the controller fails safely under stale leases, missing checks, interrupted operations, changed targets, and other documented failure modes."
      inputs_parameters: "qualification scenarios"
      dependencies_touched: "Controller, store, verifier, delivery adapters"
      technical_notes_edge_cases: "A safe blocked/reconciled state may be the correct result; false success is prohibited."
      acceptance_criteria: "Qualification suite produces the expected state transition for every supported scenario."
    feature_development_status: "Planned"
```

## Governance

`PRD.md` is the functional source of truth. A behavior-changing commit must update the affected feature record here and the corresponding execution state in `TODO.md`. Private conversation content, hidden prompting, and chain-of-thought are never repository documentation.
