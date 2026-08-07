# layout-porter

**Визначення**: `~/.claude/agents/layout-porter.md` · модель: sonnet · інструменти: файли+bash

Портує секції верстки в OpenCart 3 модулі теми: controller + twig + мовні файли (uk+ru) за патерном `about_*`/`dealer_*` з hydrophob.net.

## Коли використовувати
- Нова сторінка в натяжці, секцій ≥3, верстка-джерело вже визначена.
- Обʼємно і механічно; дизайн-рішення вже ухвалені оркестратором.

## Що знає патерн
- 1 секція = 1 модуль (`{% include %}` в OC3 не працює — ArrayLoader).
- Мовні ключі → twig автоматично (event/language merge).
- Layout-підвʼязка: генерує `layout.sql` (oc_layout + oc_layout_route + oc_layout_module + `module_*_status=1`), НЕ виконує.
- `php -l` кожного файлу; не комітить.

## Промпт-заготовка
```
Порт сторінки <назва> в OC3 (тема hydrophob, проект /шлях).
Джерело: git show main:sections/<page>/*.php (список: hero, intro, ...).
Модулі назви: <page>_hero, <page>_intro, ...
Мови: uk-ua (контент з джерела/strings.json), ru-ru (переклад).
Верстка 1:1, іконки SVG інлайн з main:helper/general.php.
Згенеруй layout.sql окремо, не виконуй. php -l усе.
```

## Після агента (оркестратор)
1. Переглянути diff усіх файлів.
2. Показати layout.sql користувачу → підтвердження → застосувати локально → тест → прод.
3. Права модулів: guarded JSON_ARRAY_APPEND в oc_user_group (див. [[common-bugs|Пастки OC3]]).
4. Деплой, коміт.
