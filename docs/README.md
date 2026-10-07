# Project Documentation

## Project

Name: Rasadgah — KPI observatory

Version: 0.1.0

Status: draft

Repository rules for contributors and AI agents: [AGENTS.md](../AGENTS.md).

## Documentation Map

| ID       | Document                                                                                      | Type          | Status     |
| -------- | --------------------------------------------------------------------------------------------- | ------------- | ---------- |
| PRJ-001  | [Project Overview](00-project/README.md)                                                      | overview      | proposed   |
| REQ-000  | [System Requirements](01-requirements/requirements.md)                                        | requirement   | proposed   |
| API-001  | [HTTP API Specification](02-specification/api-specification.md)                               | specification | proposed   |
| INT-001  | [KPI File Format](02-specification/kpi-file-format.md)                                        | specification | proposed   |
| DES-001  | [System Architecture](03-design/architecture.md)                                              | design        | proposed   |
| DES-002  | [Token and Session Lifecycle](03-design/session-lifecycle.md)                                 | design        | proposed   |
| ADR-001  | [Next.js server with standalone output](03-design/adr/adr-001-nextjs-standalone-server.md)    | decision      | approved   |
| ADR-002  | [File-based session storage](03-design/adr/adr-002-file-based-session-storage.md)             | decision      | approved   |
| ADR-003  | [Caddy for TLS termination](03-design/adr/adr-003-caddy-tls-termination.md)                   | decision      | approved   |
| ADR-004  | [Bearer-token access without user accounts](03-design/adr/adr-004-anonymous-bearer-tokens.md) | decision      | deprecated |
| ADR-005  | [Separate read and write tokens](03-design/adr/adr-005-read-and-write-tokens.md)              | decision      | approved   |
| REF-020  | [Branding and Design System](03-design/branding/README.md)                                    | reference     | approved   |
| DES-010  | [Theming and Localisation](03-design/branding/theme.md)                                       | design        | approved   |
| DES-011  | [Colour Palette](03-design/branding/color-palette/color-palette.md)                           | design        | approved   |
| DES-012  | [GUI Layout](03-design/branding/gui-layout/layout-description.md)                             | design        | approved   |
| REF-021  | [Typography](03-design/branding/fonts/fonts.md)                                               | reference     | approved   |
| REF-022  | [Logo Assets and Usage](03-design/branding/logo/README.md)                                    | reference     | approved   |
| REF-023  | [Logo Candidates and Evaluation](03-design/branding/logo/candidates/README.md)                | reference     | approved   |
| REF-024  | [Product Description](03-design/branding/messaging/product-description.md)                    | reference     | approved   |
| REF-025  | [Slogan, Taglines and Voice](03-design/branding/messaging/slogan.md)                          | reference     | approved   |
| PROC-001 | [Development Guide](04-development/development-guide.md)                                      | procedure     | proposed   |
| TST-000  | [Test Specification](05-testing/test-specification.md)                                        | test          | proposed   |
| USR-001  | [User Guide](06-user/user-guide.md)                                                           | user-guide    | proposed   |
| REF-001  | [Configuration Reference](07-reference/configuration.md)                                      | reference     | proposed   |
| REF-002  | [Troubleshooting](07-reference/troubleshooting.md)                                            | reference     | proposed   |
| REF-004  | [Developer Reference](07-reference/developer-reference.md)                                    | reference     | proposed   |
| REF-003  | [Release Notes](08-release/release-notes.md)                                                  | release       | draft      |
| PROC-002 | [How to deploy to a server](howtos/howto-deploy-to-server.md)                                 | procedure     | proposed   |
| PROC-003 | [How to configure the CI/CD pipeline](howtos/howto-configure-ci-cd.md)                        | procedure     | proposed   |
| PROC-004 | [How to back up and restore data](howtos/howto-backup-restore.md)                             | procedure     | proposed   |

## Architecture

[System Architecture](03-design/architecture.md)

## Branding

[Branding and Design System](03-design/branding/README.md)

## Requirements

[System Requirements](01-requirements/requirements.md)

## Development

[Development Guide](04-development/development-guide.md)

## Testing

[Test Specification](05-testing/test-specification.md)

## User Documentation

[User Guide](06-user/user-guide.md)

## References

[Developer Reference](07-reference/developer-reference.md)

## AI Instructions

[AI documentation index](09-ai/README.md)
