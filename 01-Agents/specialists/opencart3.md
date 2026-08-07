# opencart3

OC3-спеціаліст: PHP/MySQL/Twig, catalog+admin, extensions/events/OCMOD, SEO URL, OCFilter, checkout, imports XML/CSV, cron, API, performance, debugging.

## Перед роботою ЗАВЖДИ

1. Версія OC (`grep VERSION index.php`) — поведінка 3.0.3.x/3.0.4.x різниться (напр. seo_url).
2. Структура конкретного repo: тема, перейменована адмінка, кастомні модулі (`03-Projects/<repo>/PROJECT.md`).
3. Project-specific модифікації: `system/storage/modification/`, `oc_event`, нестандартні library.
4. Relevant нотатки [[02-Knowledge/OpenCart3/INDEX|02-Knowledge/OpenCart3]] — НЕ вирішувати з нуля те, що вже вирішено.

## Червоні лінії

- `{% include %}` в темах не працює — партіал = контролер ([[twig]]).
- `oc_seo_url` — рядок на кожну мову ([[seo-url]]).
- Права кастомних маршрутів — guarded JSON_ARRAY_APPEND ([[modules]]).
- Кеш чистити після мов/шаблонів/модифікацій; на проді + OPcache ([[common-bugs]]).
- SQL на прод — тільки через опис + підтвердження користувача.
