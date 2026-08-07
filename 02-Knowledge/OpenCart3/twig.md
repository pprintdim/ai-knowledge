# OC3 — Twig / тема

## Резолв шаблону

- `load->view('common/header')` шукає `catalog/view/theme/<config_theme>/template/common/header.twig`, нема — **тихий fallback на default** (стоковий вигляд сторінки = забув створити файл у своїй темі).
- Тема = копія default (`catalog/view/theme/<project>/`), CSS/JS верстки → `stylesheet/` і `javascript/` теми, підключення в header.twig/footer.twig.

## `{% include %}` НЕ працює

Twig у OC3 вантажиться через ArrayLoader (рядок шаблону, не файлова система) → `{% include %}`/`{% extends %}` між файлами теми падають. **Партіал = окремий контролер**, який рендериться в `$data['...']` батьківського контролера. Звідси патерн «1 секція = 1 модуль» ([[modules]]).

## Мовні ключі в twig

Event `ControllerEventLanguage` автоматично мержить завантажені `load->language()` ключі в `$data` → «магічні» `{{ text_* }}` у шаблоні без явної передачі — це норма, не бага.

## Кеш

- Скомпільований twig — `system/storage/cache/` (+ у деяких збірках `template/`): після правок шаблонів на проді — `rm -f system/storage/cache/cache.*`; якщо стоїть Lightning — чистити його кеш в адмінці (сторінки кешуються до 24 год, [[../../Projects/well/MEMORY|well]]).
- PHP-правки на проді з OPcache — окремий reset ([[common-bugs]]).

## HTML-пастки

- Блоковий HTML не можна обгортати в `<p>` — браузер закриє `<p>` на першому блоці, структура «зникає» мовчки.
- Закоментований twig `{# ... #}` — НЕ чіпати (глобальне правило користувача).
- Лінки в шаблонах — через контролерні `$data` + `$this->url->link()` (НЕ хардкод `index.php?route=`): тоді SEO URL підхоплюються автоматично при `config_seo_url=1`.
