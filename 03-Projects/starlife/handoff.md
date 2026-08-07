> [!note] Імпортовано з `/Applications/MAMP/htdocs/starlife/handoff.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 1. Оригінал: untracked, видалений.

# Handoff — starlife (WordPress)

Знімок стану роботи. Gitignований — не комітиться.

## Сервер (спільний VPS, CloudPanel)

- IP: 46.224.100.254 (той самий сервер, що й hydrophob.net.ua, shokeru.in.ua, hydrophob.net, sites.pprintdim.com, pprintdim.com)
- SSH user: root, пароль — див. `<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>` (SSH пароль АКТУАЛЬНИЙ) — секрет не дублюю, сервер спільний
- Панель: CloudPanel (`clpctl`)

## Сайт: starlife.net.ua (актуальний, єдиний)

- Домен: starlife.net.ua, DNS переведено на 46.224.100.254 (перевірено `dig` на 8.8.8.8/1.1.1.1)
- Корінь на сервері: `/home/starlifenet/htdocs/starlife.net.ua`
- Site user: `starlifenet`, креденшали — `/root/starlifenet-site-credentials` на сервері; SFTP вже прописаний у `.vscode/sftp.json`
- БД: `starlifenet`, креденшали — `/root/starlifenet-db-credentials` на сервері
- Let's Encrypt SSL встановлено, валідний до 2026-10-25
- Перевірено публічно по HTTPS: `/`, `/privacy-policy/`, `/wp-login.php`, `/wp-json/` — усі `200`

## Історія міграції (2026-07-27)

1. Старий деплой на `185.104.45.109` видалено, сайт перенесено на `46.224.100.254` під сабдомен `starlife.pprintdim.com` (БД `starlife`, 14 таблиць), SSL встановлено.
2. Куплено окремий домен `starlife.net.ua`. Створено новий сайт на тому ж сервері (site user `starlifenet`, БД `starlifenet`), файли (2.1 ГБ) і БД перенесені з сабдомену.
3. Всі посилання в БД замінено `starlife.pprintdim.com` → `starlife.net.ua` (wp_options, wp_posts.guid/post_content, wp_postmeta, wp_users.user_url + escaped-URL в налаштуваннях плагіна Duplicator Pro). Аудит — 0 залишків.
4. DNS `starlife.net.ua` користувач перевів на сервер, Let's Encrypt SSL встановлено, сайт перевірено публічно.
5. Старий сабдомен-сайт `starlife.pprintdim.com` видалено (`clpctl site:delete`, разом з ним автоматично прибрано і БД `starlife`). Credential-файли `/root/starlife-site-credentials`, `/root/starlife-db-credentials` на сервері прибрано.

## Незакриті задачі

Немає — міграція на `starlife.net.ua` завершена повністю, старий сабдомен видалено.

## Нюанси

- Codex CLI сесія (VSCode) впала на `usage_limit_exceeded` під час частини роботи над сабдоменом — довершено вручну (Claude Code) через SSH напряму.
- Не плутати з `hydrophob-landing` — інший сайт на тому ж фізичному сервері, окремий site user і БД.
