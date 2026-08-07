# seo-filler

**Визначення**: `~/.claude/agents/seo-filler.md` · модель: sonnet · має WebFetch

Наповнення `oc_seo_url` (товари/категорії/route-сторінки, мультимовно) + meta title/description з реальних джерел.

## Коли використовувати
- Запуск каталогу натяжки: слаги з prom.ua CSV (колонка url → `p<id>-<slug>.html`), мета скрапінгом живих сторінок.
- Доповнення слагів при додаванні мови (дубль рядків на language_id).

## Ключові знання патерну
- `oc_seo_url` в OC 3.0.3.x МАЄ language_id — без дублю на кожну мову друга мова живе на index.php.
- Route-слаг ≠ назва фізичної теки (catalog/image/system) — інакше 301 від вебсервера.
- Колізії слагів джерела → суфікс `-<product_id>`.
- INSERT без seo_url_id; DELETE тільки свого типу query, НЕ TRUNCATE (інфо-рядки живуть поруч).

## Промпт-заготовка
```
Збери СЕО для <проект>: слаги товарів з materials/products.csv (url колонка),
meta title/description скрап зі сторінок prom (без парафразу).
Мови: language_id 1 і 3 (однакові keyword).
Вихід: seo-import.sql + product-seo-meta.csv. SQL не виконуй.
```

## Після агента
SQL → підтвердження → локально → перевірити 3-4 URL курлом → прод. Хуки route-слагів у `startup/seo_url.php` — робота оркестратора, не агента.
