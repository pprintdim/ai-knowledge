# nanochemicalgroup — MEMORY

## Стан (2026-10-11)
- Репо `pprintdim/nanochemicalgroup`: гілка `lovable` — джерело (TanStack Start + Vite, НЕ чіпати), `main` — статична верстка (prerender: `/` + `/ui-kit`), затерта з React-сорсів 2026-10-10.
- Білд: `npm install && npm run build` на сорсах lovable; vite.config.ts локально доповнюється `prerender {enabled, crawlLinks} + pages ["/","/ui-kit"]` → `.output/public/` = статика.
- CloudPanel: сайт `nanochemical.group` створено (site user `nanochemical`, PHP 8.3 Generic). Креди — ACCESS.md.
- Hetzner DNS зона 1637266 створена, A @/www → 46.224.100.254. **Домен НЕ зареєстрований** (RDAP: not found) — користувач має зареєструвати і вказати NS hydrogen/oxygen.ns.hetzner.com + helium.ns.hetzner.de.
- LE-сертифікат НЕ виданий — неможливо до делегації домену.
- Деплой: `<проєкт>/deploy.sh` (gitignored, rsync site user-ом; `--full` = --delete). 2026-10-11 деплой завис: мережа користувача (хотспот 192.168.189.x) блокує вихідні 22/2222/8443 повністю (навіть github:22) — фоновий ретрай чекав відкриття порту.

## TODO
- [x] Задеплоєно 2026-10-11, обидві сторінки 200
- [x] Домен делеговано, LE-сертифікат встановлено 2026-10-11, https працює

## 2026-10-11 — свап сторінок
- `/` = Visual System (колишній ui-kit), `/ui-kit` = прототип головної («From molecule to surface»). У хедері головної кнопка «Prototype →».
- Зміни сорсів відносно lovable (свап роутів, менший hero-лого, prerender у vite.config) — у `build.patch` в корені main. При наступному білді: worktree з lovable → `git apply build.patch` → npm run build.
