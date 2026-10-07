---
id: REF-001
title: Configuration Reference
type: reference
status: proposed
version: 1.0
audience:
  - administrator
  - developer
tags:
  - configuration
---

# Configuration Reference

Authoritative list of configuration variables. Template: [.env.example](../../.env.example).

## Table of Contents

- [1. Purpose](#1-purpose)
- [2. Docker Compose Variables](#2-docker-compose-variables)
- [3. Application Variables](#3-application-variables)
- [4. Build-time Settings](#4-build-time-settings)
- [5. CI/CD Settings](#5-cicd-settings)
- [6. Fixed Values](#6-fixed-values)
- [7. Related Documents](#7-related-documents)

## 1. Purpose

Lists every variable that changes the behaviour of the stack, with default and effect.

## 2. Docker Compose Variables

Set in the shell or in `.env` next to `compose.yaml`.

| Variable           | Default     | Used by | Effect                                                                                               |
| ------------------ | ----------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `SITE_ADDRESS`     | `localhost` | proxy   | Hostname Caddy serves. A public domain triggers Let's Encrypt; `localhost` uses Caddy's internal CA. |
| `HTTP_PORT`        | `80`        | proxy   | Host port for HTTP (redirects to HTTPS).                                                             |
| `HTTPS_PORT`       | `443`       | proxy   | Host port for HTTPS (TCP and UDP/HTTP3).                                                             |
| `APP_IMAGE`        | `rasadgah`  | app     | Image repository, for example `ghcr.io/keyhad/rasadgah`.                                             |
| `APP_TAG`          | `local`     | app     | Image tag, for example `main` or `sha-<commit>`.                                                     |
| `TOKENS_PER_HOUR`  | `30`        | app     | Passed to the application (Section 3).                                                               |
| `MAX_UPLOAD_BYTES` | `262144`    | app     | Passed to the application (Section 3).                                                               |

## 3. Application Variables

Read by [src/server/container.ts](../../src/server/container.ts). Invalid or non-positive numbers fall back to the default.

| Variable           | Default                                   | Effect                                                  |
| ------------------ | ----------------------------------------- | ------------------------------------------------------- |
| `DATA_DIR`         | `/data` in the image; `./.data` otherwise | Directory for session files.                            |
| `TOKENS_PER_HOUR`  | `30`                                      | Maximum tokens per client IP per fixed one-hour window. |
| `MAX_UPLOAD_BYTES` | `262144`                                  | Maximum KPI upload size in bytes.                       |
| `PORT`             | `3000`                                    | HTTP port of the Next.js server.                        |
| `HOSTNAME`         | `0.0.0.0`                                 | Bind address of the Next.js server.                     |

## 4. Build-time Settings

| Location                               | Setting                 | Value                                                             |
| -------------------------------------- | ----------------------- | ----------------------------------------------------------------- |
| [next.config.ts](../../next.config.ts) | `output`                | `standalone`                                                      |
| [next.config.ts](../../next.config.ts) | Security headers        | See [DES-001, Section 7](../03-design/architecture.md#7-security) |
| [Caddyfile](../../Caddyfile)           | `request_body max_size` | `1MB`                                                             |
| [Dockerfile](../../Dockerfile)         | `NODE_VERSION`          | `22`                                                              |
| [Dockerfile](../../Dockerfile)         | `PLAYWRIGHT_VERSION`    | Shall equal the installed `@playwright/test` version              |

## 5. CI/CD Settings

Configured in GitHub under **Settings → Secrets and variables → Actions**. See [PROC-003](../howtos/howto-configure-ci-cd.md).

| Name             | Kind     | Required for | Purpose                                                           |
| ---------------- | -------- | ------------ | ----------------------------------------------------------------- |
| `DEPLOY_HOST`    | variable | deploy job   | Server hostname or IP. The deploy job runs only when this is set. |
| `SITE_ADDRESS`   | variable | deploy job   | Public domain for Caddy.                                          |
| `DEPLOY_USER`    | secret   | deploy job   | SSH user on the server.                                           |
| `DEPLOY_SSH_KEY` | secret   | deploy job   | Private SSH key (ed25519) for `DEPLOY_USER`.                      |

## 6. Fixed Values

| Value                       | Location                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| Token lifetime: 7 days      | `TOKEN_LIFETIME_MS` in [src/domain/session.ts](../../src/domain/session.ts)                  |
| Token length: 32 characters | [src/infrastructure/system.ts](../../src/infrastructure/system.ts)                           |
| Maximum KPIs per file: 100  | `MAX_KPIS` in [src/application/kpiReportSchema.ts](../../src/application/kpiReportSchema.ts) |
| Purge interval: 1 hour      | [src/instrumentation.ts](../../src/instrumentation.ts)                                       |

## 7. Related Documents

- [PROC-002 How to deploy to a server](../howtos/howto-deploy-to-server.md)
