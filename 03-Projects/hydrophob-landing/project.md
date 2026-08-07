> [!note] Імпортовано з `/Applications/MAMP/htdocs/hydrophob-landing/project.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 0. Оригінал: untracked, видалений.

# Hydrophob Landing — контекст для AI

Перед роботою прочитати цей файл. Після суттєвих змін оновлювати «Поточний стан» і «Журнал змін», особливо перед compact/compaction. Код і фактичні файли мають пріоритет над цим описом. Не записувати сюди секрети, токени або API-ключі.

## Середовище

- Корінь: `/Applications/MAMP/htdocs/hydrophob-landing`
- Локальна адреса: `http://localhost:8888/hydrophob-landing/`
- Стек: PHP, HTML, CSS, vanilla JavaScript, MAMP
- Головна сторінка: `index.php`
- `index.html` видалено.

## Структура

- `index.php` — каркас і підключення секцій.
- `sections/` — header, footer та 14 основних секцій.
- `css/style.css` — стилі й адаптив.
- `js/script.js` — UI, локалізація, слайдери, кошик та оформлення.
- `data/products.json` — дані товарів.
- `img/`, `video/` — production-медіа.
- `downloaded-images/` — окремо складені відібрані WebP із Google Drive; до сторінки не підключені.

## Google Drive

- Джерело: `https://drive.google.com/drive/folders/1atiZ90ZjthfRk2SvbCDpx0u2bo1QJ6lT`
- Пріоритет матеріалів: `FOTO FINAL` / `VIDEO FINAL`, потім інші папки.
- Відібрано 32 фото без точних дублікатів: 27 товарних і 5 композиційних.
- Вони лежать у `downloaded-images/webp/`; реєстр — `downloaded-images/photo-selection.tsv`.
- Відео з Drive ще не завантажувалися. Основний попередній кандидат: `HYDROFOB vol2.0.mov`.

## Правила

1. Не змінювати дизайн, тексти, DOM-класи або поведінку без запиту користувача.
2. Нові секції створювати в `sections/` і підключати через `index.php`.
3. Після PHP-змін запускати `php -l`; після JS-змін — `node --check js/script.js`.
4. Не змішувати `downloaded-images/` з production-медіа, доки користувач не попросить підключити конкретні файли.
5. Спілкуватися українською, якщо користувач не попросив іншу мову.

## Поточний стан

- Сторінка розділена на PHP-секції.
- Кошик зберігається у `localStorage` під ключем `hydrophob_cart`.
- Додано fixed-кнопку кошика справа: вона видима при непорожньому кошику; бейдж кількості показується від двох одиниць товару.
- Натискання fixed-кнопки відкриває наявний modal кошика.
- Активний період і часовий пояс таймера задаються в `.env` через `ACTION_TIMER_START`, `ACTION_TIMER_END` і `ACTION_TIMER_TIMEZONE`.

## Журнал змін

### 2026-07-15

- Відновлено `project.md`, оскільки файл був відсутній у робочій папці.
- У `sections/cart.php` додано fixed-кнопку кошика.
- У `js/script.js` додано синхронізацію видимості та кількості з `hydrophob_cart`.
- У `css/style.css` додано desktop/mobile-стилі fixed-кнопки й бейджа.
- PHP і JavaScript пройшли синтаксичну перевірку.

### 2026-07-15 — таймер акції

- Дату завершення таймера прибрано з `js/script.js`.
- У `.env` і `.env.example` додано `ACTION_TIMER_END` та `ACTION_TIMER_TIMEZONE`.
- `sections/action.php` передає нормалізовану ISO-дату в JavaScript через `data-timer-end`.
- На SFTP-сервер завантажено `sections/action.php`, `sections/cart.php`, `js/script.js` і `css/style.css`.
- Серверний `.env` доповнено `ACTION_TIMER_END` та `ACTION_TIMER_TIMEZONE` без перезапису інших змінних.
- Контрольні суми чотирьох локальних і серверних файлів збігаються. Публічна HTTP-перевірка в момент деплою отримала захисну відповідь `429`, але SFTP-деплой підтверджений хешами.
- Додано початок активності `ACTION_TIMER_START`; поза інтервалом від start до end таймер показує нулі.
