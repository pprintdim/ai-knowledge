# video-warmup — прогрів роликів під прелоадером (усі сайти групи, 2026-10-25)

Спільний модуль `video-warmup.js` (копія в кожній темі, md5 має збігатись між сайтами; еталон — brosse `catalog/view/theme/brosse/javascript/video-warmup.js`).

**Ідея:** поки на першому відкритті на екрані логотип-прелоадер/велком, усі `<video>` головної збираються з DOM і докачуються: hero (у межах 1.5 висоти екрана або `data-warm="hero"`) → `fetch` + blob + підміна `src`/`data-src*` на `blob:` (оригінал у `*-orig`), решта → лише HTTP-кеш; `data-warm="lazy"` — лайтбокси/модалки, лише кеш в останню чергу; `data-warm="skip"` — сам ролик велкому. Гейт `videoWarmup.gate(6000)` додається в `Promise.all` готовності прелоадера. Бюджети: телефон 25 МБ / blob 8 МБ, ПК 80 / 40; `Save-Data`/2G — лише hero. Якщо blob не заграв — `error` повертає оригінальні шляхи; обірване тіло (`b.size != Content-Length`) не підміняється.

**Граблі:**
- `start()` треба кликати, коли ролики вже в DOM: якщо накладка стоїть у `home.twig` ПЕРЕД `<main>`, її inline-скрипт виконується до роликів → `start()` на `DOMContentLoaded` (так у hydrophob ×4).
- Паралельні `fetch(priority: high)` відбирають канал у самого ролика велкому → на welcome-сайтах старт прогріву після `videoReady` тизера.
- Теми, що читають не `data-src` (hydrophob: `data-mp4`, `data-desktop-src`) — додати `data-src` дубль або брати через `videoWarmup.resolve(url)`.
- Приховані на телефоні комірки мають rect 0,0 → класифікуються як hero: ставити `data-warm="scroll"`.
- Великі десктопні hero (hydrophob.net 16–38 МБ) за 6 с не докачуються — питання розміру файлів, не модуля.
- Велком brosse/realchem живе ВСЕРЕДИНІ `<main>`; на `main` під тизером `filter`+`transform` → `position: fixed` накладки рахується від `main`. brosse: накладка переноситься в `<body>` скриптом (коміт fe63e63).

**Перевірка:** `scratchpad/warmup/cdp-warmup.mjs <url> mobile|desktop` (headless Chrome через CDP, без puppeteer): hero → `blob:` і readyState ≥ 2 після згортання, scroll → `only-if-cached` 200. Селектори накладок: `.wl-overlay`, `#rc-intro` (realchem), `#wl-preloader`/`#hp-preloader` (hydrophob). Тести ганяти ПОСЛІДОВНО — паралельні Chrome ділять канал і дають хибні «не докачалось».
