# Guía SDD por Agente de IA

Cómo usar las **SDD Skills** del workshop Álbum Mundial 2026 con distintos
asistentes de código: Cursor, Claude, Copilot, **Codex**, **OpenCode**,
**Antigravity**, Gemini y más.

**Repo de skills:** [github.com/sivaprasadreddy/sdd-skills](https://github.com/sivaprasadreddy/sdd-skills)

---

## Instalación universal (todos los agentes)

Un solo comando instala las 8 skills SDD y las copia a los agentes detectados:

```bash
npx skills add https://github.com/sivaprasadreddy/sdd-skills -y
```

Opciones útiles:

```bash
# Solo para agentes concretos
npx skills add https://github.com/sivaprasadreddy/sdd-skills -a cursor -a claude-code -a codex -y

# Instalación global (todas tus carpetas de proyecto)
npx skills add https://github.com/sivaprasadreddy/sdd-skills -g -y

# Ver qué skills hay sin instalar
npx skills add https://github.com/sivaprasadreddy/sdd-skills --list

# Actualizar skills instaladas
npx skills update -y
```

Verificar instalación:

```bash
npx skills list
```

---

## Las 8 skills SDD

| Comando | Qué hace |
|---------|----------|
| `/sdd-init` | Analiza el proyecto → `docs/project.md` |
| `/sdd-feature <desc>` | Idea → `feature.md` |
| `/sdd-refine <cambio>` | Actualiza `feature.md` |
| `/sdd-plan` | `feature.md` → `plan.md` |
| `/sdd-implement` | Ejecuta `plan.md` |
| `/sdd-review` | Review → `review.md` |
| `/sdd-archive [nombre]` | Archiva specs |
| `/sdd-yolo <desc>` | Pipeline completo (fast path) |

> **Nota:** No todos los agentes soportan `/comando` igual. Si no funciona,
> usa el **prompt alternativo** de cada sección (copiar/pegar).

---

## Contexto siempre activo

Independientemente del agente, el proyecto incluye:

| Archivo | Quién lo lee |
|---------|--------------|
| `docs/project.md` | Todas las skills SDD |
| `AGENTS.md` | Cursor, Codex, Gemini, Copilot, OpenCode… |
| `CLAUDE.md` | Claude Code (alternativa a AGENTS.md) |

Si tu agente no carga `AGENTS.md` automáticamente, pega al inicio de cada sesión:

```
Lee docs/project.md y AGENTS.md antes de hacer nada.
Este proyecto usa Spec Driven Development (SDD).
```

---

## Matriz rápida — ¿Qué agente usar en el taller?

| Agente | Dificultad taller | Skills `/sdd-*` | Recomendación |
|--------|-------------------|-----------------|---------------|
| **Cursor** | ⭐ Fácil | ✅ Nativo | **Demo principal** |
| **Claude Code** | ⭐ Fácil | ✅ Nativo | Muy bueno para SDD (autor del repo) |
| **GitHub Copilot** | ⭐⭐ Media | ✅ Con skills | Si el centro ya tiene licencia GitHub |
| **Codex (OpenAI)** | ⭐⭐ Media | ✅ CLI | Terminal pura, CI-friendly |
| **OpenCode** | ⭐⭐ Media | ✅ TUI | Terminal multi-modelo |
| **Gemini CLI** | ⭐⭐ Media | ✅ | Google en terminal |
| **Antigravity** | ⭐⭐ Media | ✅ | **IDE Google — track recomendado** |
| **Windsurf** | ⭐⭐ Media | ✅ | Alternativa a Cursor |
| **Cline** | ⭐⭐ Media | ✅ | Extensión VS Code open source |
| **Continue** | ⭐⭐⭐ Avanzada | ✅ | Multi-modelo en VS Code |
| **ChatGPT web** | ⭐⭐⭐ Manual | ❌ | Solo spec/plan; código en IDE |
| **Gemini web** | ⭐⭐⭐ Manual | ❌ | Igual que ChatGPT |

---

## 1. Cursor

**Instalación skills:** automática con `npx skills add …` → `.agents/skills/`

**Cómo invocar:**

```
/sdd-init
/sdd-feature Álbum digital del Mundial 2026...
/sdd-plan
/sdd-implement
```

**Tips taller:**
- Abrir el proyecto en Cursor antes de instalar skills
- Las skills aparecen al escribir `/` en el chat
- Reiniciar Cursor si no las detecta tras instalar

**Prompt alternativo** (si `/sdd-feature` no aparece):

```
Activa la skill sdd-feature. Lee docs/project.md y genera feature.md
para: Álbum digital del Mundial FIFA 2026 con equipos, grupos, cromos y bracket.
```

---

## 2. Claude Code (Anthropic)

**Ruta skills:** `.claude/skills/` (proyecto) o `~/.claude/skills/` (global)

**Instalación:**

```bash
npx skills add https://github.com/sivaprasadreddy/sdd-skills -a claude-code -y
```

**Cómo invocar:**

```bash
cd tu-proyecto
claude
# Dentro del chat:
/sdd-init
/sdd-feature Álbum digital del Mundial 2026...
```

**Contexto extra:** crea `CLAUDE.md` (copia de `AGENTS.md`) si no existe:

```bash
cp AGENTS.md CLAUDE.md
```

**Tips taller:**
- Claude Code es el agente que el autor de sdd-skills documenta primero
- Funciona muy bien con el flujo paso a paso (no saltar fases)
- Para alumnos sin IDE: `claude` en terminal es suficiente para backend

---

## 3. GitHub Copilot

Copilot tiene **dos modos** distintos:

### Copilot Chat / Agent (VS Code, JetBrains, Visual Studio)

**Instalación skills:**

```bash
npx skills add https://github.com/sivaprasadreddy/sdd-skills -a github-copilot -y
```

**Ruta:** `.agents/skills/` → `~/.copilot/skills/`

**Cómo invocar:**
- En VS Code: abrir Copilot Chat → escribir `/sdd-feature` si aparece en autocompletado
- Si no hay slash commands: usar prompt alternativo

**Prompt alternativo:**

```
Sigue la skill sdd-feature en .agents/skills/sdd-feature/SKILL.md.
Lee docs/project.md. Genera feature.md para el Álbum Mundial 2026.
```

### Copilot autocompletado (inline)

No ejecuta skills SDD. Solo ayuda mientras el alumno escribe código
**después** de `/sdd-implement`. Útil como complemento, no como agente SDD.

**Tips taller:**
- Copilot Agent mode (no solo inline) para pasos SDD
- Verificar licencia GitHub Education / Copilot Business del centro

---

## 4. OpenAI Codex (terminal)

Agente en **terminal** de OpenAI. Ideal para alumnos que no quieren IDE con IA
integrada y para demostrar SDD como pipeline reproducible en consola.

### Requisitos

- Cuenta OpenAI con acceso a Codex
- [Codex CLI](https://developers.openai.com/codex) instalado
- Node.js 20+ (para `npx skills`)

### Instalación skills

```bash
cd tu-proyecto
npx skills add https://github.com/sivaprasadreddy/sdd-skills -a codex -y
```

**Rutas:**
- Proyecto: `.agents/skills/` (symlink → `~/.codex/skills/` según instalación)
- Global: `~/.codex/skills/`

Verificar:

```bash
npx skills list -a codex
ls .agents/skills/sdd-init/SKILL.md
```

### Primer arranque

```bash
cd tu-proyecto
codex
```

Al inicio de sesión, Codex lee `AGENTS.md` si está en la raíz del repo.

### Flujo SDD en el taller (paso a paso)

```bash
# 1. Contexto del proyecto
/sdd-init

# 2. Spec
/sdd-feature Álbum digital del Mundial FIFA 2026: equipos, grupos, cromos y bracket eliminatorio

# 3. Refine (opcional)
/sdd-refine Añadir filtro por confederación y cromo SEDE para MEX, CAN, USA

# 4. Plan
/sdd-plan

# 5. Implementación (Codex edita archivos y ejecuta mvn test)
/sdd-implement

# 6. Review
/sdd-review

# 7. Archivo
/sdd-archive album-mundial-2026
```

**Fast path:**

```
/sdd-yolo Álbum digital del Mundial 2026 con equipos, grupos, cromos y bracket
```

### Prompt alternativo (sin slash commands)

```
Lee .agents/skills/sdd-feature/SKILL.md y docs/project.md.
Ejecuta el proceso sdd-feature para:
Álbum digital del Mundial FIFA 2026 con equipos, grupos, cromos y bracket.
Escribe feature.md en la raíz del proyecto.
```

### Tips taller

- Codex puede **ejecutar comandos** (`mvn test`, `npm run build`) — ideal para `/sdd-implement`
- Mantener el repo en Git: los alumnos ven el diff tras cada paso SDD
- Si salta al código: `Para. No implementes sin plan.md aprobado.`
- Combinar con otro alumno en **Antigravity** para la parte Angular (UI visual)

### Verificación

```bash
codex --version
npx skills list -a codex | grep sdd
cd backend-spring && mvn test
```

---

## 5. Google Antigravity (IDE)

**Antigravity** es el IDE agentico de Google (basado en Gemini). Recomendado si
el centro tiene cuenta Google / Google Cloud / Google for Education.

### Requisitos

- [Google Antigravity](https://antigravity.google/) instalado
- Cuenta Google con acceso al producto
- Node.js 20+

### Instalación skills

```bash
cd tu-proyecto
npx skills add https://github.com/sivaprasadreddy/sdd-skills -a antigravity -y
```

También disponible la variante CLI:

```bash
npx skills add https://github.com/sivaprasadreddy/sdd-skills -a antigravity-cli -y
```

**Rutas:**
- Proyecto: `.agents/skills/`
- Global IDE: `~/.gemini/antigravity/skills/`
- Global CLI: `~/.gemini/antigravity-cli/skills/`

Verificar:

```bash
npx skills list -a antigravity
ls .agents/skills/sdd-feature/SKILL.md
```

### Configuración del proyecto

Antigravity respeta `AGENTS.md` en la raíz. Asegúrate de que existe:

```bash
test -f AGENTS.md || cp docs/project.md AGENTS.md  # o usa el AGENTS.md del repo
```

### Flujo SDD en el taller

Abrir el proyecto en Antigravity → panel de agente → escribir:

```
/sdd-init
```

Luego seguir el guion del workshop:

| Bloque | Comando | Resultado |
|--------|---------|-----------|
| Spec | `/sdd-feature Álbum digital del Mundial 2026...` | `feature.md` |
| Refine | `/sdd-refine Añadir filtro confederación...` | `feature.md` actualizado |
| Plan | `/sdd-plan` | `plan.md` |
| Code | `/sdd-implement` | Spring Boot + Angular |
| Review | `/sdd-review` | `review.md` |
| Archive | `/sdd-archive album-mundial-2026` | `docs/specs-archive/` |

### Prompt alternativo

```
Activa la skill sdd-plan. Lee feature.md y docs/project.md.
Genera plan.md con pasos Flyway → JPA → REST → Angular → tests.
No escribas código hasta que yo apruebe el plan.
```

### Tips taller — track Google

| Ventaja | Cómo aprovecharla |
|---------|-------------------|
| Gemini multimodal | Pegar wireframes del workshop como contexto en `/sdd-feature` |
| IDE integrado | Un solo entorno para backend Java + frontend Angular |
| Ecosistema Google | Alumnos con Chromebook / cuenta institucional @edu |

**Pairing recomendado en aula mixta:**

```
Alumno A (Antigravity)  →  frontend Angular + review visual
Alumno B (Codex)        →  backend Spring Boot + mvn test
Handoff                 →  feature.md / plan.md en Git
```

### Verificación

```bash
npx skills list -a antigravity | grep sdd
test -f docs/project.md && echo "OK"
```

---

## 6. OpenCode (terminal multi-modelo)

**OpenCode** es un agente TUI en terminal que soporta varios modelos
(Anthropic, OpenAI, Google, local). Alternativa open source a Codex para
alumnos que prefieren consola pero quieren elegir proveedor.

### Requisitos

- [OpenCode](https://opencode.ai/) instalado
- API key del proveedor elegido (OpenAI, Anthropic, Google…)
- Node.js 20+

### Instalación

```bash
# OpenCode (según documentación oficial)
curl -fsSL https://opencode.ai/install | bash

# Skills SDD
cd tu-proyecto
npx skills add https://github.com/sivaprasadreddy/sdd-skills -a opencode -y
```

**Rutas:**
- Proyecto: `.agents/skills/`
- Global: `~/.config/opencode/skills/`

Verificar:

```bash
opencode --version
npx skills list -a opencode | grep sdd
```

### Primer arranque

```bash
cd tu-proyecto
opencode
```

OpenCode detecta `AGENTS.md` y las skills en `.agents/skills/`.

### Flujo SDD en el taller

Misma secuencia que Codex:

```
/sdd-init
/sdd-feature Álbum digital del Mundial FIFA 2026...
/sdd-plan
/sdd-implement
/sdd-review
/sdd-archive album-mundial-2026
```

### Prompt alternativo

```
Read AGENTS.md and docs/project.md.
Follow .agents/skills/sdd-implement/SKILL.md step by step.
Do not skip failing tests.
```

### Codex vs OpenCode — ¿cuál elegir?

| Criterio | Codex | OpenCode |
|----------|-------|----------|
| Proveedor | OpenAI | Multi-modelo |
| Licencia centro | OpenAI / ChatGPT Plus | Flexible (BYOK) |
| Skills SDD | ✅ `-a codex` | ✅ `-a opencode` |
| Interfaz | Terminal OpenAI | TUI open source |
| Taller Java+Angular | ✅ | ✅ |

**Recomendación:** si el centro tiene **solo Google**, usa Antigravity.
Si tiene **solo OpenAI**, Codex. Si los alumnos traen **su propia API key**, OpenCode.

### Tips taller

- Configurar el modelo una vez antes del taller (`opencode config`)
- Probar `/sdd-init` en señal de red lenta antes de abrir el aula
- OpenCode + Ollama local posible para demo offline (modelo más débil en spec)

### Verificación

```bash
opencode --version
npx skills list -a opencode
ls .agents/skills/sdd-yolo/SKILL.md
```

---

## 7. Google Gemini CLI

Complemento terminal del ecosistema Google (sin IDE). Útil si tienen Gemini API
pero no Antigravity instalado.

**Instalación:**

```bash
npx skills add https://github.com/sivaprasadreddy/sdd-skills -a gemini-cli -y
```

**Ruta:** `.agents/skills/` → `~/.gemini/skills/`

**Cómo invocar:**

```bash
gemini
/sdd-feature Álbum Mundial 2026...
```

> Para centros Google, **Antigravity (sección 5)** suele ser mejor experiencia
> que Gemini CLI aislado. Usa Gemini CLI como plan B.

### Gemini web (gemini.google.com)

No soporta skills instaladas. Usar **solo para fases de spec**:

**Prompt para generar feature.md:**

```
Eres un analista de requisitos. Lee este contexto de proyecto:
[pegar contenido de docs/project.md]

Genera un feature.md con user stories, FR-01…, AC-01… para:
Álbum digital del Mundial FIFA 2026 con equipos, grupos, cromos y bracket.
Formato markdown, listo para copiar al repo.
```

Luego copiar el resultado al IDE con Antigravity / Cursor / Codex para implementar.

---

## 8. Otros agentes recomendados para el taller

### Windsurf (Codeium)

```bash
npx skills add https://github.com/sivaprasadreddy/sdd-skills -a windsurf -y
```

IDE similar a Cursor. Skills en `.windsurf/skills/`. Buena alternativa si
algunos alumnos no tienen Cursor.

### Cline (extensión VS Code)

```bash
npx skills add https://github.com/sivaprasadreddy/sdd-skills -a cline -y
```

Open source, funciona con API keys de Anthropic/OpenAI/Google.
Skills en `.agents/skills/`. Muy usado en centros con VS Code.

### Continue (extensión VS Code / JetBrains)

```bash
npx skills add https://github.com/sivaprasadreddy/sdd-skills -a continue -y
```

Multi-modelo (OpenAI, Anthropic, Ollama local). Skills en `.continue/skills/`.

### Roo Code (fork de Cline)

```bash
npx skills add https://github.com/sivaprasadreddy/sdd-skills -a roo -y
```

Skills en `.roo/skills/`.

---

## 9. ChatGPT (OpenAI web) — modo manual

ChatGPT web **no instala skills**, pero sirve para enseñar la **fase de spec**:

1. Pegar `docs/project.md` en el chat
2. Pedir generar `feature.md` siguiendo la estructura SDD
3. Revisar y copiar al repo
4. Implementar con Cursor / Claude Code / Codex

**Prompt plantilla:**

```
Actúa como analista de requisitos senior (Spec Driven Development).

Contexto del proyecto:
---
[pegar docs/project.md]
---

Genera feature.md para: [descripción de la feature].

Estructura obligatoria:
- Summary, User Stories, Functional Requirements (FR-01…),
  Acceptance Criteria (AC-01…), Technical Scope,
  Non-Functional Requirements, Out of Scope, Open Questions.

No generes código. Solo la spec.
```

---

## 10. Configuración recomendada por aula

### Escenario A — Un solo agente (más simple)

Todos usan **Cursor** o **Claude Code**:

```bash
git clone <repo-taller>
cd <repo-taller>
npx skills add https://github.com/sivaprasadreddy/sdd-skills -a cursor -y
# seguir docs/workshop-mundial-2026.md
```

### Escenario B — Mix de herramientas (realista)

| Rol | Agente | Fases SDD |
|-----|--------|-----------|
| Spec / requisitos | ChatGPT, Gemini web, Claude | `/sdd-feature`, `/sdd-refine` |
| Implementación | Cursor, Antigravity, Windsurf | `/sdd-plan`, `/sdd-implement` |
| Backend terminal | Codex, OpenCode | `/sdd-implement`, `mvn test` |
| Review | Claude Code, Codex, Antigravity | `/sdd-review`, `/sdd-archive` |

**Regla de oro:** el handoff entre agentes es siempre un **archivo**
(`feature.md`, `plan.md`), nunca el historial del chat.

### Escenario C — Track Google (Antigravity)

Centro con Google for Education / Workspace:

```bash
git clone <repo-taller>
cd <repo-taller>
npx skills add https://github.com/sivaprasadreddy/sdd-skills -a antigravity -y
# Abrir en Antigravity → /sdd-init → seguir workshop
```

Todos los alumnos usan Antigravity para el flujo completo. Opcional: Gemini web
solo para borrador de `feature.md` en grupos.

### Escenario D — Track terminal (Codex + OpenCode)

Centro sin IDE agentico unificado — alumnos con terminal:

```bash
# Instalar skills para ambos (el CLI instala solo lo detectado)
npx skills add https://github.com/sivaprasadreddy/sdd-skills -a codex -a opencode -y

# Alumno con OpenAI:
codex
/sdd-init

# Alumno con API key propia / multi-modelo:
opencode
/sdd-init
```

Mismo repo, mismos archivos SDD, distinto shell. El instructor revisa
`feature.md` y `mvn test`, no el agente usado.

### Escenario E — Sin agente con skills

1. Descargar skills manualmente desde GitHub → `skills/sdd-feature/SKILL.md`
2. Copiar el contenido del SKILL.md como prompt en cualquier LLM
3. Pegar la respuesta en el archivo correspondiente

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| `/sdd-init` no aparece | `npx skills list` · reiniciar agente · `-a <agente> -y` |
| El agente salta al código | Decir: *"Para. Lee feature.md. No implementes sin plan.md."* |
| No lee `docs/project.md` | Pegar manualmente al inicio del chat |
| Skills instaladas pero vacías | `npx skills update -y` |
| Alumno con VS Code + Copilot only | Usar prompts alternativos + Copilot inline en implement |
| Antigravity no detecta skills | `npx skills add … -a antigravity -y` · reiniciar IDE |
| Codex / OpenCode no encuentra AGENTS.md | Verificar que estás en la raíz del repo con `AGENTS.md` |
| OpenCode — modelo incorrecto | `opencode config` antes del taller |
| Spring Initializr falla | Boot **3.5.0+** (ver `tmp/workshop-rehearsal/REHEARSAL-LOG.md`) |
| Flyway CHAR vs VARCHAR | Usar `VARCHAR(1)` en migraciones |

---

## Comandos de verificación post-instalación

```bash
# 1. Skills instaladas
npx skills list | grep sdd

# 2. Contexto del proyecto
test -f docs/project.md && echo "OK project.md"

# 3. Ensayo completo (opcional)
cd tmp/workshop-rehearsal/backend-spring && mvn test
cd tmp/workshop-rehearsal/frontend && npm run build
```

---

## Referencias

| Recurso | URL |
|---------|-----|
| SDD Skills | [github.com/sivaprasadreddy/sdd-skills](https://github.com/sivaprasadreddy/sdd-skills) |
| Skills CLI | [github.com/vercel-labs/skills](https://github.com/vercel-labs/skills) |
| Directorio skills | [skills.sh](https://skills.sh) |
| Agentes soportados | [skills.sh/agent](https://skills.sh/agent) |
| Workshop Mundial 2026 | [docs/workshop-mundial-2026.md](workshop-mundial-2026.md) |
| Ensayo verificado | [tmp/workshop-rehearsal/REHEARSAL-LOG.md](../tmp/workshop-rehearsal/REHEARSAL-LOG.md) |

---

## Resumen para el instructor

1. **Instalar una vez:** `npx skills add https://github.com/sivaprasadreddy/sdd-skills -y`
2. **Mismo flujo, distinto shell:** spec → plan → code → review → archive
3. **El archivo es el contrato**, no el chat
4. **Demo en vivo:** Cursor o Claude Code (más predecible)
5. **Track Google:** Antigravity — sección 5
6. **Track terminal:** Codex (OpenAI) u OpenCode (multi-modelo) — secciones 4 y 6
7. **Copilot / Gemini web** como complemento en spec o aulas mixtas
8. **Windsurf + Cline + Continue** si no hay licencias uniformes

### Instalación rápida por track

```bash
# Track Cursor (demo principal)
npx skills add https://github.com/sivaprasadreddy/sdd-skills -a cursor -y

# Track Google
npx skills add https://github.com/sivaprasadreddy/sdd-skills -a antigravity -y

# Track terminal
npx skills add https://github.com/sivaprasadreddy/sdd-skills -a codex -a opencode -y

# Aula mixta — instalar todo de una vez
npx skills add https://github.com/sivaprasadreddy/sdd-skills -y
```
