# OC3 — модулі та layout

## Модуль-тройка (тема)

1. `catalog/controller/extension/module/<code>.php` — `ControllerExtensionModule<Code>::index()` повертає `$this->load->view(...)`.
2. `catalog/view/theme/<t>/template/extension/module/<code>.twig`.
3. `catalog/language/<lang>/extension/module/<code>.php` (uk + ru).

Адмін-частина (якщо модуль конфігурується): `admin/controller/extension/module/<code>.php` + модель + twig + мова.

## Патерн «сторінка = набір модулів» (натяжки)

Кожна контент-сторінка: route-контролер (маршрут) + N модулів-секцій через Design→Layout. Причина: `{% include %}` не працює ([[twig]]). Генерацію тройок — на [[layout-porter]].

## Layout-привʼязка (SQL, без адмінки)

```sql
-- 1. layout
INSERT INTO oc_layout (name) VALUES ('Назва');
-- 2. route → layout
INSERT INTO oc_layout_route (layout_id, store_id, route) VALUES (X, 0, 'information/dealers');
-- 3. модулі в позицію
INSERT INTO oc_layout_module (layout_id, code, position, sort_order)
VALUES (X, 'dealer_hero', 'content_top', 1);
```

**Обовʼязково**: `oc_setting` → `module_<code>_status = 1` (code=`module_<code>`) — без цього content_top модуль НЕ вантажить, мовчки.

## Права на кастомні маршрути

`oc_user_group.permission` — JSON з екранованими слешами → `LIKE '%route%'` бреше.
Guarded-патерн: `JSON_SEARCH(permission,'one','route') IS NULL` → подвійний `JSON_ARRAY_APPEND` (access + modify). Джерело: shokeru → hydrophob.net.

## Чистка стока

Зайві платіжки/доставки/модулі: видалити файли + звірити `oc_extension` (записи-сироти ламають сторінку Extensions в адмінці).
