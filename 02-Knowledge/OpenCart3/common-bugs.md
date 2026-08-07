---
aliases: [Пастки OC3]
---
# Пастки OC3 — короткий довідник

Граблі, на які вже наступали. Поповнювати після кожного проекту.

## Twig/тема
- `{% include %}` не працює (ArrayLoader) → партіал = окремий контролер.
- Ключі load->language автоматично мержаться в twig (event `ControllerEventLanguage`) — «магічні» `{{ text_* }}` це норм.
- Блок-HTML не можна обгортати в `<p>` — браузер закриє його на першому блоці, структура «зникає».
- Шаблону нема в темі → тихий fallback на default (стоковий вигляд = забув створити файл у темі).

## Мови
- Глобальний мовний файл МУСИТЬ зватись `<code>.php` усередині теки мови — інакше `Language::get()` віддає самі ключі (ціни «600decimal_point00»).
- `oc_language` рядок другої мови на прод — легко забути; без нього перемикач мовчки скидає на дефолт.
- `getLanguages()` кешується — `rm system/storage/cache/cache.catalog.language.*` після змін.

## SEO
- `oc_seo_url.language_id`: рядки на КОЖНУ мову, інакше друга мова на index.php.
- Route-слаг ≠ назва фізичної теки web-root.
- 301-хук: тільки GET, не-AJAX, safe-list маршрутів; масиви в GET (category[]) імплодити.
- `{page}` плейсхолдер пагінації: rawurlencode ламає його в query — у twig replace обох варіантів або нести в path літералом.

## Checkout
- `guest/save` ставить shipping_address ЛИШЕ з `shipping_address=1` у POST.
- `shipping_method/save` падає без попереднього GET `checkout/shipping_method` (session quotes).
- Порядок: guest/save → GET ship → save → GET pay → save → GET confirm (створює order) → `extension/payment/<code>/confirm`.

## БД/права
- Права кастомних маршрутів: `permission LIKE '%route%'` бреше (json-екрановані слеші) → `JSON_SEARCH(permission,'one','route') IS NULL` + подвійний `JSON_ARRAY_APPEND` (access+modify), guarded.
- Категорії без `oc_category_path` = порожні стокові вибірки.
- Сесії OC3 у БД (`oc_session`), не у файлах — дебаг session-даних через SELECT.
- `Currency::format` бере decimal_point з мови — див. пастку глобального файлу.

## Деплой/шелл
- rsync БЕЗ `--relative` з files-from кладе все плоско в корінь.
- rsync `--files-from` НЕ копіює вміст директорій одним рядком — гітігноровані asset-теки окремими прямими rsync з trailing slash.
- zsh: `for x in $VAR` не сплітить (`${=VAR}`); цикли з curl глючать — окремі виклики або PHP.
- `git add -A` без `git status` = закомічені гігабайти materials/.
- `git checkout <old> -- шлях` при перейменованій теці створює файли за СТАРИМ шляхом.
- macOS iCloud-теки (Obsidian vault) недоступні терміналу без Full Disk Access.

## Агенти
- Прогрес агента, не записаний на диск, гине при session limit — інкрементальний запис обовʼязковий у промпті.
- «Success»-звіт агента ≠ файли на диску — завжди `ls`/`wc -l` перевірка.
- Codex sandbox `workspace-write` без мережі (SSH/деплой йому не давати).
