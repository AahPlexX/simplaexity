# Internal Documentation Standard

`PRD.md` defines intended functional scope. `TODO.md` defines execution state. `docs/STATUS.md` is the concise current frontier. `docs/HANDOFF.md` is the cold-start continuation guide. `docs/ARCHITECTURE.md` records current system structure. `docs/DECISIONS.md` records durable technical rulings. `CHANGELOG.md` records completed repository changes.

Governance rules:

1. Every feature has a stable ID used consistently across PRD, TODO, tests, and status notes where applicable.
2. Feature statuses are `Planned`, `In Progress`, `Blocked`, `Verification Pending`, or `Complete`.
3. `Complete` means implementation exists and executable verification evidence passes; code presence alone is insufficient.
4. A behavior-changing commit updates all affected internal documentation in the same change.
5. TODO checkboxes reflect evidence, not optimism. Do not pre-check implementation or verification work.
6. Technical decisions that future agents must preserve belong in `docs/DECISIONS.md` with date, decision, rationale, and migration trigger.
7. Handoff instructions must be sufficient for a model with no conversation history.
8. Repository documentation contains project facts and decisions only. Do not include private prompting, hidden reasoning, chain-of-thought, or conversational editorialization.
9. If implementation contradicts documentation, treat the project as blocked until the discrepancy is reconciled.
