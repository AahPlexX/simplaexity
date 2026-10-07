# Internal Documentation Standard

This standard governs durable project documentation. Repository documentation contains project facts, decisions, execution state, and verification evidence only; it must never contain private prompting, hidden reasoning, chain-of-thought, or conversational editorialization.

## Canonical documents

- `PRD.md` — intended functional scope and stable feature contracts.
- `TODO.md` — executable work state and verification checklist.
- `docs/STATUS.md` — concise current frontier, active gate, and immediate next phase.
- `docs/HANDOFF.md` — cold-start continuation procedure for an agent with no conversation history.
- `docs/ARCHITECTURE.md` — current system structure, boundaries, invariants, and migration triggers.
- `docs/DECISIONS.md` — durable technical rulings with rationale and migration conditions.
- `CHANGELOG.md` — completed repository changes and significant verification milestones.

## Required PRD schema

Every `PRD.md` must preserve these semantic fields, regardless of Markdown presentation:

```yaml
project_identity:
  name: ""
  slug: ""
  development_status: ""
  current_phase: ""
  last_updated: ""

technical_foundation:
  architecture_and_engine: ""
  dependencies_used: []

core_feature_specifications:
  - name: ""
    id: ""
    details:
      purpose: ""
      inputs_parameters: ""
      dependencies_touched: ""
      technical_notes_edge_cases: ""
      acceptance_criteria: ""
      verification_evidence: ""
    feature_development_status: ""
```

Fields that are genuinely not applicable may say `Not Applicable`; they are not silently omitted. `verification_evidence` remains empty or explicitly pending until executable evidence exists.

## Required TODO schema

Every `TODO.md` must include project status, current phase, architecture/engine, last-updated date, dependency state, and one execution block per stable feature ID. Each feature block contains:

- Purpose.
- Inputs / parameters.
- Dependencies touched.
- Technical notes and edge cases.
- Implementation details.
- Verification and state sign-off.

A feature checkbox and `Complete` status may be set only after its acceptance criteria have current executable evidence. The final section must distinguish phase/integration completion from overall project completion when later features remain open.

## Status contract

Allowed feature statuses are exactly:

- `Planned`
- `In Progress`
- `Blocked`
- `Verification Pending`
- `Complete`

`Complete` means implementation exists **and** executable verification evidence passes against the relevant current revision. Code presence, a previous unrelated green run, or an agent claim is insufficient.

## Governance rules

1. Every feature has one stable ID used consistently across PRD, TODO, tests, status notes, and evidence where applicable.
2. A behavior-changing commit updates all affected durable documentation before the feature is signed off.
3. TODO checkboxes reflect evidence, not optimism; do not pre-check implementation or verification work.
4. Verification evidence records the exact revision/run or other reproducible proof sufficient to re-establish the claim.
5. Technical decisions future agents must preserve belong in `docs/DECISIONS.md` with date, decision, rationale, and a migration trigger when one exists.
6. `docs/STATUS.md` must name the current phase, strongest verified baseline, active gate, and next frontier without relying on chat context.
7. `docs/HANDOFF.md` must let a model with no conversation history locate the sources of truth, reproduce the environment, run verification, and identify the next safe action.
8. `docs/ARCHITECTURE.md` must describe current boundaries and invariants, not aspirational architecture presented as implemented fact.
9. `CHANGELOG.md` records repository changes and verified milestones; it is not a substitute for current-state PRD/TODO/STATUS records.
10. If implementation, tests, or documentation contradict one another, treat the affected scope as blocked until reconciled.
11. Do not delete or overwrite unrelated project documentation while updating the current feature; preserve historical and cross-feature context unless a governed migration explicitly replaces it.
12. Overall project status becomes `Complete` only when every mandatory feature is `Complete`, final integration verification passes, and no documented blocker remains.
