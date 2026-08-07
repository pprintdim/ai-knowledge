# well — MEMORY

## Активна задача: OCFilter SEO-сторінки не підміняють мета

- Механізм: `Seo::startup()` (`system/library/ocfilter/seo.php:88-126`) → `getPageByParams` (`catalog/model/extension/module/ocfilter.php:1828`) → підміна H1/meta в `system/library/ocfilter/api.php:171-203`. Не знайдено сторінку → fallback `getMetaText()` (генеричний тайтл + назви фільтрів) — це і є симптом.
- Ключова умова: `placement->isCategory()` вимагає модуль ocfilter у layout категорії (`oc_layout_module.code='ocfilter'`) — інакше підміна пропускається повністю.
- Гіпотези (ранжовано): 1) модуль не в layout категорії; 2) сторінка status=0 / не та language_id; 3) params_key mismatch; 4) не привʼязана до store.
- Діагностика готова: read-only `ocf_diag_9f3a1c.php` у корені — виконати на сервері або локалці з дампом. SELECT-и дозволені.
- На сервері вже є `ocfilter_seo_import.php` (хтось із команди донабивав SEO keyword-и для ocfilter_page).

## Інше

- Git-історія pprintdim/wellua очищена (пароль БД прибраний); **пароль БД з витоку досі не змінений** — нагадувати.
- 19 локально видалених файлів (amazon/paypal/sagepay/...) — застейджені, НЕ закомічені.
- PHP локально 8.3, при падінні OC3 — переключити MAMP на 7.4.
