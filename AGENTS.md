# AGENTS.md

Guidance for AI agents and human contributors working in this repository. Read this file first, then follow the rules it references.

## Table of Contents

- [1. Project Summary](#1-project-summary)
- [2. Rules and Precedence](#2-rules-and-precedence)
- [3. Agent Personas](#3-agent-personas)
- [4. Templates](#4-templates)
- [5. Commands](#5-commands)
- [6. Architecture Constraints](#6-architecture-constraints)
- [7. Definition of Done](#7-definition-of-done)
- [8. Documentation Map](#8-documentation-map)

## 1. Project Summary

Rasadgah is a KPI monitoring web application (Next.js, TypeScript) served over HTTPS behind Caddy and deployed with Docker Compose. A visitor receives a write token and a read token, uploads a KPI JSON file with the write token, and shares `/?token=<read token>`, which shows only the KPIs and their freshness. Both tokens expire one week after the last upload.

The authoritative project description is [PRJ-001 Project Overview](docs/00-project/README.md).

## 2. Rules and Precedence

Rules are stored under [.ai/](.ai/). Shared rules live in `.ai/core/`; rules specific to this repository live in `.ai/project/`.

| Rule                                                                               | Scope in this repository                                                                                                                                                   |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Documentation rules](.ai/core/rules/50-documenting-rules.md)                      | Applies in full to `docs/`, `AGENTS.md` and `.ai/project/`.                                                                                                                |
| [TypeScript coding standards](.ai/project/rules/10-typescript-coding-standards.md) | Applies to all source code.                                                                                                                                                |
| [Security rules](.ai/project/rules/40-security.md)                                 | Applies to all code, configuration and pipelines.                                                                                                                          |
| [Core coding standards](.ai/core/rules/10-coding-standards.md)                     | Applies only to Python code. The repository currently contains none.                                                                                                       |
| [Core security rules](.ai/core/rules/40-security-env.md)                           | The general principles apply (no secrets in version control, `.env.example` lists every variable). Service-specific sections (databases, MQTT, edge devices) do not apply. |

When a project rule and a core rule conflict, the project rule shall take precedence.

## 3. Agent Personas

Use the persona that matches the task:

| Persona                                           | Use for                                                                                                                     |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [docs-agent](.ai/core/agents/docs-agent.md)       | Creating or reviewing anything under `docs/`                                                                                |
| [architect](.ai/core/agents/architect.md)         | Changes that affect layers, storage, deployment or the API                                                                  |
| [code-reviewer](.ai/core/agents/code-reviewer.md) | Reviewing changes. Apply its checklist using the TypeScript rules in Section 2.                                             |
| [db-guru](.ai/core/agents/db-guru.md)             | Not applicable while sessions are stored as files (see [ADR-002](docs/03-design/adr/adr-002-file-based-session-storage.md)) |

## 4. Templates

| Template                                                               | Use for                                                                                        |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [Documentation templates](.ai/core/templates/documenting-templates.md) | Every new document under `docs/`                                                               |
| [Pull request review](.ai/core/templates/pr-review.md)                 | Pull request descriptions and reviews                                                          |
| [Incident analysis](.ai/core/templates/incident-analysis.md)           | Production incidents; see also [REF-002 Troubleshooting](docs/07-reference/troubleshooting.md) |

## 5. Commands

Node.js is not required on the host. Every task runs in Docker:

```bash
docker compose --profile test run --rm test   # lint + typecheck + unit tests with coverage
docker compose --profile test run --rm e2e    # Playwright end-to-end tests
docker compose --profile dev up dev           # hot-reload development server on :3000
docker compose up -d --build                  # production stack on https://localhost
```

Details: [PROC-001 Development Guide](docs/04-development/development-guide.md).

## 6. Architecture Constraints

- Dependencies shall point inwards: `domain` ← `application` ← `infrastructure` / `presentation` ← `server` / `app`. ESLint enforces this in [eslint.config.mjs](eslint.config.mjs).
- `src/app/**` shall contain only thin Next.js adapters; logic belongs in the layers.
- `src/server/container.ts` is the only composition root.
- Changes to the API or the KPI file format shall update [API-001](docs/02-specification/api-specification.md) or [INT-001](docs/02-specification/kpi-file-format.md) in the same change.

Rationale and component descriptions: [DES-001 Architecture](docs/03-design/architecture.md).

## 7. Definition of Done

A change is complete when:

1. `docker compose --profile test run --rm test` passes. Coverage thresholds are enforced.
2. `docker compose --profile test run --rm e2e` passes for changes that affect behaviour.
3. Affected documents are updated, including requirement-to-test traceability in [TST-000](docs/05-testing/test-specification.md).
4. No secret, token or credential is committed.
5. The release notes in [REF-003](docs/08-release/release-notes.md) list user-visible changes.

## 8. Documentation Map

The index of all documents is [docs/README.md](docs/README.md).
