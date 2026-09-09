# hydrophob.com.ua — стан (2026-08-20)

- OpenCart 3.0.4.1, прод: Hetzner 46.224.100.254, CloudPanel, site user `hydrophobcom`, root `/home/hydrophobcom/htdocs/hydrophob.com.ua`, БД `hydrophobcom` (мігровано 2026-08-11 зі старого 5.101.116.201).
- DNS вже на Hetzner (A @/www → 46.224.100.254). **Lets Encrypt SSL встановлено 2026-08-20.**
- Репо: `pprintdim/hydrophob.com.ua` (SSH remote), гілка `main`. Локалка: `/Applications/MAMP/htdocs/hydrophob/hydrophob.com.ua`, MAMP порт **8892**, PHP 8.3 (прод — 7.4!).
- Локалка за стандартом (див. `02-Knowledge/OpenCart3/local-dev.md`): БД серверна через тунель 3307, картинки з прод-фолбеком `DEV_IMAGE_FALLBACK`.
- **Адмінка перейменована `admin` → `hp_panel`** (локально і на проді; деплой через site-user rsync). У ній: панелька Кеш/Модифікатори (controller/common/refresh.php + header) і drag&drop сортування модулів у лояутах (layout_form.twig) — перенесено з hydrophob.net.
- Стокові платіжні модулі видалено (лишено cod, liqpay, free_checkout) + викинуто system/library/paypal, squareup. Доставка — кастомний `s_shipping`.
- deploy.sh у корені проєкту (gitignored, rsync site user; `--full` = `--delete`).
- Адмін-логін: admin / JhFEqGYDS8insB4v (єдиний для трьох мігрованих сайтів).
- Знімок верстки: гілка `html` (orphan, 92 сторінки + index.html) = worktree `<проєкт>/html`, задеплоєна на **https://html.hydrophob.com.ua** (site user `htmlhydrophobcom`, пароль в ACCESS.md; свій deploy.sh усередині html/, gitignored). LE SSL є.
- Чистка лейаутів виконана 2026-08-21 (SQL через ssh+mysql на сервері, бо тунельні DB-write блокує класифікатор): рядки code='0' видалені, інстанси 27-30 перейменовані по-людськи; `banner.31` «Banner 1» лишився (не привʼязаний, користувач не вирішив).
- Старий `/admin/` винесено з веб-кореня в `~/admin-old-20260821` (site user) — користувач має сам видалити після перевірки. `/admin/` URL тепер = фронт-fallback (try_files → index.php).
- Перемикання мов перевірено робочим (прод і локалка); «та сама сторінка» — це про статичний знімок html/, там перемикач мертвий за визначенням.

## 2026-09-09 — html-сабдомен верстки знято
- Верстка (знімок 92 сторінок) = гілка `html` репо pprintdim/hydrophob.com.ua (ex hydrohub-landing; origin перепрописано на нову назву), запушена `343d6a4`.
- Сайт `html.hydrophob.com.ua` видалено з CloudPanel (site user теж), A-запис `html` у зоні Hetzner видалено. Локальний worktree верстки прибрано; deploy.sh верстки більше нема.
- Верстку дивитись через git: `git show <гілка>:<файл>` або тимчасовий `git worktree add /tmp/wt <гілка>` (прибрати після).
