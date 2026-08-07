# OC3 — SEO URL

## База

- Вмикання: `oc_setting` → `config_seo_url=1` + rewrite: локально `.htaccess` (з стокового `.htaccess.txt`; потрібен коректний `RewriteBase` — тому локальний vhost із root=текою проєкту, НЕ підпапка), прод nginx: `location @seo_url { rewrite ^/(.+)$ /index.php?_route_=$1 last; }`.
- `oc_seo_url`: query (`product_id=X`) ↔ keyword. **В 3.0.3.x+ Є `language_id`** → рядок на КОЖНУ мову, інакше друга мова живе на `index.php?route=` ([[multilingual]]).
- Шаблони правити не треба: `$this->url->link()` сам підхоплює слаги.

## Route-слаги (сторінки без query-параметрів)

`/katalog`, `/kontakty` тощо — хук у `catalog/controller/startup/seo_url.php`: мапа slug→route в `index()` (parse) + `rewrite()` (генерація). Плюс `common/home` → `/`.

- Слаг НЕ має збігатись з імʼям фізичної теки web-root (catalog/, image/, system/) — інакше вебсервер віддасть 301 на теку раніше за PHP.
- 301-канонікалізація прямих `index.php?route=` заходів: тільки GET, не-AJAX, **safe-list маршрутів** (нові route дописувати в нього); масиви в GET (`category[]`) імплодити перед redirect.

## Слаги даних (натяжки)

- Джерело — реальні слаги (prom.ua CSV, колонка url → `p<id>-<slug>.html`), не вигадані; колізії → суфікс `-<product_id>`. Виконавець: [[seo-filler]].
- INSERT без `seo_url_id`; чистка — DELETE тільки свого типу query, НЕ TRUNCATE (route/інфо-рядки живуть поруч).

## Фільтри/пагінація в path

`/katalog/<cat>/sort-x/page-N`: плейсхолдер `{page}` пагінації НЕ можна rawurlencode-ити у query — у twig replace обох варіантів або нести в path літералом.

## OCFilter (well)

Підміна H1/meta сторінок фільтра працює ТІЛЬКИ якщо модуль ocfilter привʼязаний до layout категорії (`isModuleInLayout()` по `oc_layout_module.code='ocfilter'`). Інакше — генеричний fallback `getMetaText()`. Деталі/діагностика: [[../../Projects/well/MEMORY|well MEMORY]].
