# OC3 — база даних

## Ключові таблиці (звичний префікс `oc_`)

- Каталог: `product`, `product_description` (×мови), `product_to_category`, `product_to_store`, `category`, `category_description`, **`category_path`** — без заповненого path стокові вибірки категорії мовчки порожні (materialized closure table; для root: category_id=path_id, level=0).
- Налаштування: `setting` (key/value, серед них `module_<code>_status`, `config_seo_url`, `theme_default_*`), `extension` (встановлені розширення за типами).
- Layout: `layout`, `layout_route`, `layout_module` ([[modules]]).
- SEO: `seo_url` (з language_id — [[seo-url]]).
- Users/права: `user_group.permission` — JSON, пастка пошуку ([[modules]]).
- `session` — **сесії OC3 живуть у БД**, не у файлах → дебаг session-даних через SELECT data FROM oc_session.
- `event`, `modification` — [[events-ocmod]].

## Звички

- Match зовнішніх даних по `oc_product.model` = зовнішній id (prom.ua тощо) — патерн [[db-content-loader]].
- Ідемпотентні імпорти: свій DELETE перед INSERT (тільки своїх рядків, не TRUNCATE).
- SQL на прод: файл scp → `mysql` з креденшелами з серверного config.php → файл видалити.
- Локальний MAMP: `127.0.0.1:8889`, root/root.
- **Глобальне правило**: будь-який SQL — опис + підтвердження користувача ПЕРЕД виконанням.
