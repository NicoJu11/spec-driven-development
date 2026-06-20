# Álbum Mundial 2026 — Workshop SDD

Workshop de **Spec Driven Development** para construir un álbum digital del
Mundial FIFA 2026 con Java, Spring Boot, Quarkus y Angular.

## Quick start

```bash
# 1. Instalar skills SDD (ya hecho si clonaste este repo)
npx skills add https://github.com/sivaprasadreddy/sdd-skills -y

# 2. Seguir el guion paso a paso
open docs/workshop-mundial-2026.md
```

## SDD Workflow

```
/sdd-init  →  /sdd-feature  →  /sdd-refine*  →  /sdd-plan  →  /sdd-implement  →  /sdd-review  →  /sdd-archive
```

Fast path: `/sdd-yolo <descripción de la feature>`

## Documentación

| Archivo | Propósito |
|---------|-----------|
| [docs/workshop-mundial-2026.md](docs/workshop-mundial-2026.md) | Guion completo del taller (7 bloques) |
| [docs/guia-agentes-ia.md](docs/guia-agentes-ia.md) | Cursor, Claude, Copilot, Codex, Gemini y más |
| [docs/project.md](docs/project.md) | Contexto del proyecto para las skills SDD |
| [AGENTS.md](AGENTS.md) | Contexto SDD para el agente de IA |

## Stack

- **Backend:** Spring Boot 3.x (demo) · Quarkus 3.x (variante)
- **Frontend:** Angular 19
- **DB:** PostgreSQL / H2 · Flyway

## Referencia

Skills SDD: [github.com/sivaprasadreddy/sdd-skills](https://github.com/sivaprasadreddy/sdd-skills)
