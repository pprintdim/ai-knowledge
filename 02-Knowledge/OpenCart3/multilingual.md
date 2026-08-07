# OC3 — мультимовність

## Мовні файли (catalog + admin)

- Тека мови: `catalog/language/<code>/` (напр. `uk-ua/`). Глобальний файл МУСИТЬ зватись `<code>.php` усередині теки (`uk-ua/uk-ua.php`) — інакше `Language::get()` віддає ключі замість значень (симптом: ціни «600decimal_point00 грн» — `Currency::format` бере decimal_point з мови).
- `$_['code']` в глобальних файлах — реальний код (uk/ru/en), не всі 'en'.
- Стартовий хід натяжки: `git mv catalog/language/en-gb uk-ua` + свіжий en-gb з ванілі.

## oc_language

- Рядок на кожну активну мову; дефолт — `config_language` в oc_setting.
- **Прод-пастка**: рядок другої мови (ru) легко забути залити — перемикач мовчки скидає на дефолт.
- Перемикач фронту: POST `common/language/language` (code + redirect).

## Кеш

`getLanguages()` кешується → після БУДЬ-яких змін мов: `rm system/storage/cache/cache.catalog.language.*`.

## Контент БД

Другий language_id для `oc_product_description`, `oc_category_description`, `oc_information_description` тощо — масовий переклад через [[content-translator]] (REPLACE INTO ... SELECT з language_id=3; звіряти кількість колонок INSERT vs SELECT).

## Admin-переклад (укр адмінка)

Merge community-паку (opencartbot/Ukrainian-language-for-OpenCart) ПОВЕРХ ванільного англійського кейсету: відсутній ключ → лишається англійський текст, а не сирий ключ.

## SEO

Слаги дублюються на кожну language_id — [[seo-url]].
