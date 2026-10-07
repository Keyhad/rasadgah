# rasadgah

Lightweight web application for monitoring KPIs.

1. Open the site without a token: a unique **access token** is issued. Save it.
2. Upload a KPI JSON file with that token.
3. Revisit `/?token=<token>` to see your KPIs rendered.

A token expires **one week after the last upload** (or after issuance if nothing was uploaded). Expired tokens and their data are deleted; open `/` to get a new one.

## Quick start

Requires Docker with the Compose plugin; Node.js is not needed.

```sh
docker compose up -d --build                     # app + Caddy on https://localhost
docker compose --profile test run --rm test      # lint + typecheck + unit tests
docker compose --profile test run --rm e2e       # Playwright end-to-end tests
```

## Documentation

All documentation is in [docs/](docs/README.md):

- [User Guide](docs/06-user/user-guide.md) and [KPI File Format](docs/02-specification/kpi-file-format.md)
- [HTTP API](docs/02-specification/api-specification.md)
- [Architecture](docs/03-design/architecture.md)
- [Development Guide](docs/04-development/development-guide.md)
- [Deployment](docs/howtos/howto-deploy-to-server.md) and [CI/CD](docs/howtos/howto-configure-ci-cd.md)

Contributors and AI agents: start with [AGENTS.md](AGENTS.md).
