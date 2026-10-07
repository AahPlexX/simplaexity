# Controller Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the evidence-gated controller, durable state store, worker-safe MCP stdio surface, and CI foundation.

**Architecture:** Keep state-transition policy in one dependency-light controller. Persist snapshots atomically outside chat. Register only worker-safe tools on the MCP adapter; verification authority remains a separate boundary.

**Tech Stack:** Node.js 24.21.0 LTS, TypeScript 7.0.2, pnpm 12.10.1, `@modelcontextprotocol/server` 2.3.1, Zod 4.6.5, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-06-simplaexity-foundation-design.md`

## Global Constraints

- Exact dependency versions; no caret ranges.
- TDD RED before production implementation.
- No public worker-facing verification tool.
- File persistence remains single-controller-writer until a documented migration.
- Behavior-changing commits update governed documentation.

## Tasks

1. RED: define graph/state-machine behavior tests.
2. RED: define restart/path-safe persistence tests.
3. RED: define worker-safe MCP surface tests.
4. GREEN: implement minimal controller, store, MCP adapter, and stdio entry point.
5. Verify typecheck/test/CI; generate and commit lockfile; synchronize PRD/TODO/status/handoff/changelog.
