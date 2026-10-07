# simplaexity

Simplaexity is an evidence-gated execution controller for AI-assisted software work. It lets replaceable AI workers operate on bounded work while controller-owned state determines eligibility and a separate verifier authority determines whether completion evidence is sufficient.

## Foundation profile

The first qualified profile targets single-repository TypeScript web applications. Verified controller-foundation capabilities cover dependency-graph validation, fenced execution leases, revision-bound evidence rules, descendant invalidation, durable run snapshots, and a worker-facing MCP stdio adapter that deliberately omits verification authority.

Autonomous production database migrations, real payments, arbitrary infrastructure administration, and autonomous publishing remain out of scope until dedicated adapters and recovery procedures are qualified. The trusted verification boundary and controller failure-injection qualification remain open project features.

## Toolchain

- Node.js 24.21.0 LTS
- pnpm 12.10.1
- TypeScript 7.0.2
- `@modelcontextprotocol/server` 2.3.1
- Zod 4.6.5

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm start
```

Use the committed lockfile for reproducible installation. For project scope and current execution state, read `PRD.md` and `TODO.md`. Internal documentation is governed by `docs/DOCUMENTATION_STANDARD.md`.
