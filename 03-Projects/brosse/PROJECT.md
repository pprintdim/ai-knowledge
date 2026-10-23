# brosse — brosse.com.ua (щітки, бренд Brosse)

- Репо: `pprintdim/brosse` (GitHub, SSH). Гілки: `lovable` — джерело з Lovable (не чіпати), `html` — статична збірка верстки для сабдомена, `main` — OpenCart 3.0.3.9 (orphan, з 2026-10-13).
- Локально: `/Applications/MAMP/htdocs/NanoChemicalGroup/products/realchem/care/brosse` (робоче дерево репо; `materials/` — макети PSD/JPG, шрифти, фото — поза git).
- Верстка: TanStack Start + Vite + React (Lovable), 7 роутів: `/`, `/about`, `/product`, `/checkout`, `/contact`, `/success`, `/error`. Шрифт Seenonim (`materials/Fonts`).
- Сервер: Hetzner `46.224.100.254`, CloudPanel. Сайти:
  - `brosse.com.ua` — site user `brosse`, PHP 8.3, `/home/brosse/htdocs/brosse.com.ua`, storage поза веб-коренем `/home/brosse/storage/`, БД `brosse` (user `brosse`), vhost із OpenCart-rewrite (`@opencart`, deny system/storage), www→non-www.
  - `html.brosse.com.ua` — site user `htmlbrossecomua`, статика.
  - Обидва під LE-сертифікатом; basic-auth замки ЗНЯТО на прохання користувача (2026-10-14), індексацію тримають `config_noindex=1` і robots Disallow до запуску.
- DNS: зона Hetzner id `1642648` (@, www, html → 46.224.100.254); NS у реєстратора вже hetzner.
- Деплой: `~/AI-Workspace/scripts/brosse-deploy.sh` (OpenCart, main), `brosse-html-deploy.sh` (статика html) — root через Keychain + chown; при блокованому публічному SSH — `HETZNER_HOST=root@100.64.35.62` (Tailscale). Скрипти посадки в репо `scripts/` (home-layout, about-page, seo-brosse, product-media, hero-slides, checkout-setup.sql).
- Креди: `~/AI-Workspace/secrets/ACCESS.md`, розділ «brosse.com.ua».
- Еталон OpenCart-конвенцій: `/Applications/MAMP/htdocs/NanoChemicalGroup/products/nanochemical/autochemicals` (гілка openCart), стартовий набір `00-System/templates/opencart3-starter/`.
