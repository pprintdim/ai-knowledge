# OC3 — архітектура

## MVC-L + Registry

- Route `a/b/c` → `catalog/controller/a/b.php`, клас `ControllerAB`, метод `c()` (без `c` — `index()`).
- Усе через `$this->registry`: `load`, `db`, `request`, `response`, `session`, `config`, `url`, `customer`, `user` (admin), `document`, `cache`, `event`.
- `$this->load->model('catalog/product')` → `$this->model_catalog_product`; `->language('x/y')` повертає масив і мержиться; `->view('шлях', $data)` рендерить twig.
- Контролер → `$this->response->setOutput($this->load->view(...))`.

## Структура

- `catalog/` — фронт; `admin/` — адмінка (окремий MVC-стек, свій config.php). Адмінку в проді перейменовуємо (`git mv admin xx_panel` + обидва config.php + nginx deny).
- `system/` — ядро: `framework.php`, `startup.php`, `engine/`, `library/`, `config/`, `storage/`.
- `system/storage/` — cache, logs, modification (OCMOD-копії), session, upload. На проді права на запис від php-fpm (770), решта 750/640.
- `extension/` маршрути: `extension/module/x`, `extension/payment/x`, `extension/shipping/x` — файли в `controller/extension/<тип>/`.

## Точки входу / bootstrap

- `index.php` → `system/startup.php` → `system/framework.php`: config → registry → **startup-контролери** (`startup/startup`, `startup/router`, `startup/seo_url`, `startup/error`...) — сюди вбудовуються глобальні хуки (напр. кастомний SEO-роутинг, див. [[seo-url]]).
- `VERSION` — у `index.php`/`admin/index.php`.

## Config

- `config.php` + `admin/config.php` — шляхи, URL, DB. НЕ в git. Локальні/серверні варіанти не змішувати ([[../../Projects/well/MEMORY|well]]: `*.server.php.bak` патерн).

## Пастки рівня архітектури

- Партіал ≠ include: у темах twig вантажиться через ArrayLoader — `{% include %}` НЕ працює → партіал = окремий контролер ([[twig]]).
- Тихий fallback теми на default, якщо файлу нема в темі ([[twig]]).
- Сесії в БД `oc_session`, не у файлах ([[database]]).
