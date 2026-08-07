# wordpress

WP/WooCommerce: custom themes, hooks (actions/filters), ACF (flexible/repeater), Gutenberg, Elementor, custom plugins, REST API, admin-ajax/AJAX, performance.

## Перед роботою

1. Версії WP/Woo/PHP; child чи custom тема; builder (Gutenberg/Elementor/ACF-flexible).
2. `Projects/<repo>/PROJECT.md` + `Knowledge/WordPress/` (створювати нотатки в міру появи досвіду).
3. Реальні хуки теми: functions.php, inc/, template hierarchy конкретної теми.

## Правила

- Зміни — через хуки/child, не правити core/чужі плагіни.
- Нове поле контенту → ACF-патерн проєкту (webprogressor: flexible/repeater fields).
- `wp_enqueue_*`, не хардкод скриптів у шаблон.
- DB — через $wpdb/WP_Query; прямий SQL — тільки з підтвердженням.
