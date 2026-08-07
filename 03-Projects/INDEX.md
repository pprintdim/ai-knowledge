# Projects — INDEX усіх проєктів

Скан 2026-08-07. Детальна память — тека проєкту (PROJECT/MEMORY/TASKS); дрібні живуть тільки в цій таблиці, тека — при першій реальній задачі.

## Активні (є память)

| Проєкт | Стек | Repo | Локально | Стан |
|---|---|---|---|---|
| [[03-Projects/hydrophob.net/PROJECT\|hydrophob.net]] | OC 3.0.3.9, тема hydrophob | pprintdim/hydrophob.net (`openCart`) | htdocs/hydrophob.net | ПРОД живий; сьогодні: WayForPay порт з well |
| [[03-Projects/well/PROJECT\|well]] | OC 3.0.4.1, Lightning+Cloudflare | pprintdim/wellua (+дзеркало shcherbaks) | vs_projects/well (symlink htdocs/well) | блокер доступу; OCFilter SEO задача |
| [[03-Projects/nadel/PROJECT\|nadel]] | OC 3.0.3.9, тема nadel | NadelWeb/gmp-landing | htdocs/nadel | активний: specbrief, SMS, OTP |
| [[03-Projects/stocrm/PROJECT\|stocrm]] | Laravel+Inertia+React | pprintdim/stocrm | htdocs/stocrm | CRM Mechora; Hetzner+CloudPanel |
| [[03-Projects/webprogressor/PROJECT\|webprogressor]] | WordPress+ACF | pprintdim/webprogressor | vs_projects/webprogressor | студійний сайт; Figma DS |
| [[03-Projects/shokeru/PROJECT\|shokeru]] | OC3 (донор-патерни) | — (локально лише db backup) | htdocs/shokeru | ЕТАЛОН: OTP, path-фільтри, shk_panel |

## Решта (рядок = вся память поки що)

| Проєкт | Стек | Repo | Примітка |
|---|---|---|---|
| googlenest | OC 3.0.5.0 | pprintdim/googlenest | MAMP local магазин |
| hydrophob.ua | PHP (sectional) | pprintdim/hydrophob.ua | активна верстка (08-03) |
| hydrophob-landing | PHP лендінг | pprintdim/hydrohub-landing | handoff містить root-пароль сервера 46.224.100.254 |
| shoker.in.ua | PHP + деплой | pprintdim/shoker.in.ua | CloudPanel deploy-скрипти |
| shokstore | верстка (redesign) | pprintdim/radiant-redesign | каталог-редизайн |
| starlife | WordPress | не git | локальний WP |
| stores.crm | ? | не git | подивитись при потребі |
| pprintdim | Laravel | pprintdim/pprintdim | персональний сайт |
| freelanceAuto | PHP bot | не git | Freelancehunt API бот |
| webprogressor-теми | WP-теми | pprintdim/all_wp_themes | колекція complete-wp-themes |
| verstka / luxfinder | статика | pprintdim/verstka (гілки) | верстки; luxfinder = гілка |
| optyapply | PHP | pprintdim/optyapply | — |
| vakhiyo | статика | pprintdim/vakhiyo | GitHub Actions деплой |
| sitesHub | ? | не git | має handoff.md |

## Імпортовані службові .md (2026-08-07)

Усі handoff/project/AGENTS/analysis-нотатки з проєктів зібрані сюди й санітизовані ([[DOCS-POLICY]]): hydrophob.net · hydrophob.ua · hydrophob-landing · well · nadel · stocrm · stores.crm · shokstore · sitesHub · pprintdim · freelanceAuto · webprogressor · starlife · shoker.in.ua. Секрети замінені на `<REDACTED→secrets/ACCESS.md>`.

Оригінальний шлях указаний у callout-шапці кожної нотатки. `handoff.md` в активних проєктах більше не ведеться — актуальний стан у `MEMORY.md` + `TASKS.md` тут.

Правило: у теки 03-Projects/ НЕ копіювати код/vendor/images/дампи — тільки PROJECT/MEMORY/DECISIONS/TASKS (+ARCHITECTURE за потреби). Компактно.
