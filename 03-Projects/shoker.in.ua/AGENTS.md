> [!note] Імпортовано з `/Applications/MAMP/htdocs/ shoker.in.ua/AGENTS.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 0. Оригінал: tracked, лишився в repo.

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to Lovable. Avoid rewriting published git history:
> do not force-push, rebase, amend, or squash commits that are already pushed.
<!-- LOVABLE:END -->

## Branch workflow

- `lovable` is the design/source branch maintained by Lovable.
- `main` is the production PHP branch deployed to shoker.in.ua.
- Port approved layouts from `lovable` to small PHP partials in `sections/`.
- Never commit credentials, `.env`, or `.vscode/sftp.json`.
