# Project Context

Read `docs/project.md` for mission, tech stack, and architecture before making any decisions.

## SDD Workflow

This project uses **Spec Driven Development**. The workflow is:

1. `/sdd-init` → analyses the codebase and produces `docs/project.md` (once per project)
2. `/sdd-feature <description>` → produces `feature.md`
3. `/sdd-refine <change>` → updates `feature.md` (optional, repeatable)
4. `/sdd-plan` → reads `feature.md`, produces `plan.md`
5. `/sdd-implement` → reads `plan.md`, implements and verifies
6. `/sdd-review` → reviews code quality, security, and AC coverage
7. `/sdd-archive` → archives specs to `docs/specs-archive/<feature-name>/`

Never skip steps. Always read `docs/project.md` before planning or implementing.

## Workshop

Step-by-step demo guide: `docs/workshop-mundial-2026.md`
