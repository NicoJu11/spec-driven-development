<!--
SYNC IMPACT REPORT
==================
Version change: (blank template) → 1.0.0
Modified principles: none (initial ratification)
Added sections:
  - Core Principles (I. Library-First, II. Test-First, III. Functional-First)
  - Quality Gates
  - Development Workflow
  - Governance
Removed sections: none (initial ratification)
Templates requiring updates:
  - .specify/templates/plan-template.md  ✅ reviewed — Constitution Check section present, aligns with principles
  - .specify/templates/spec-template.md  ✅ reviewed — no changes required
  - .specify/templates/tasks-template.md ✅ reviewed — no changes required
Follow-up TODOs: none
-->

# demo-speckit Constitution

## Core Principles

### I. Library-First

Every feature MUST be implemented as a standalone library before being integrated
into any application or service layer. Libraries MUST be:

- Self-contained with a clearly defined, single responsibility.
- Independently versioned, testable, and documented.
- Free of coupling to application frameworks or deployment concerns.

A feature that cannot be expressed as a library first is a signal that its
scope or design requires refinement before implementation begins.

### II. Test-First (NON-NEGOTIABLE)

TDD is strictly enforced on this project. The Red-Green-Refactor cycle MUST
be followed without exception:

1. Write a failing test that captures the intended behavior.
2. Obtain explicit approval from a human reviewer that the test accurately
   represents the requirement.
3. Confirm the test fails for the right reason (no false passes).
4. Implement the minimum code required to make the test pass.
5. Refactor under green — no new behavior, no degraded test coverage.

Skipping or reversing these steps is a constitution violation and MUST be
flagged during code review.

### III. Functional-First

All production code MUST prefer functional programming patterns:

- Pure functions over stateful objects wherever practical.
- Immutable data structures as the default; mutation requires explicit
  justification in the PR description.
- Side effects (I/O, state, time) MUST be isolated at the boundary of a
  module and kept out of core logic.
- Higher-order functions, composition, and transformation pipelines are
  preferred over imperative loops and class hierarchies.
- Object-oriented patterns are permitted only when the domain model
  genuinely benefits from encapsulation (e.g., complex lifecycle management).

## Quality Gates

Every pull request MUST pass all of the following gates before merge:

- **Library gate**: New functionality is delivered as a library. Application
  wiring is a separate, subsequent task.
- **TDD gate**: Every changed code path has a corresponding test written before
  implementation. Coverage MUST NOT decrease.
- **Functional gate**: Core logic contains no unintentional side effects.
  Reviewers MUST verify that I/O boundaries are clearly identified.
- **Contract gate**: Public library APIs MUST have contract tests covering
  all documented behaviors.

## Development Workflow

1. **Specify** — Author a feature spec (`/speckit.specify`).
2. **Plan** — Produce a plan that identifies the library boundary and its
   public API contract (`/speckit.plan`).
3. **Test** — Write and approve tests before any implementation task begins.
4. **Implement** — Execute tasks in library-first order (`/speckit.implement`).
5. **Review** — Verify all three core principles are satisfied.
6. **Integrate** — Wire the new library into the application only after
   the library passes all quality gates independently.

## Governance

This constitution supersedes all other project practices and style guides.
Amendments require:

1. A documented rationale explaining why the amendment is necessary.
2. A migration plan for any existing code that becomes non-compliant.
3. Version increment according to semantic versioning (see below).
4. Review and approval before the amendment takes effect.

**Versioning policy**:
- MAJOR — Backward-incompatible removal or redefinition of a core principle.
- MINOR — Addition of a new principle, section, or materially expanded guidance.
- PATCH — Clarifications, wording improvements, or non-semantic refinements.

All code reviews MUST verify compliance with this constitution. Complexity
that cannot be justified against these principles MUST be simplified.

**Version**: 1.0.0 | **Ratified**: 2026-06-26 | **Last Amended**: 2026-06-26
