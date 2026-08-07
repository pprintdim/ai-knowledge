# OC3 — AJAX / JSON-ендпоінти

## Патерн контролера

Метод контролера → `$this->response->addHeader('Content-Type: application/json');` + `setOutput(json_encode($json))`. Виклик з фронту: `index.php?route=<route>` (route-ендпоінти НЕ канонікалізувати 301-редиректом — safe-list у [[seo-url]] і перевірка «не-AJAX»).

## Робочі приклади (hydrophob.net / shokeru)

- **Live search**: `product/search_suggest` — JSON-підказки + повна сторінка search окремо.
- **Контакт-форма**: AJAX `information/contact/send` (JSON) + модалка успіху; клієнтська валідація перед сабмітом.
- **Кошик**: стокові `checkout/cart/add|edit|remove` — відповіді вже JSON; кастомний лише фронт (бейдж, степер).
- **Checkout-ланцюг**: [[checkout]] — série стокових JSON-ендпоінтів.
- **OTP-код**: `common/user_popup/sendCode` (POST полів форми + type=login|register) і `verifyCode` (email+code); коди в session з TTL, логін через стоковий `customer->login($email, '', true)` (override без пароля). Реєстрація — `model account/customer::addCustomer` з випадковим паролем. Джерело: shokeru, порт у nadel/hydrophob.

## Пастки

- `getProducts()` не віддає reviews-count — per-item `getProduct()` або ModelCatalogReview.
- Фронт приймає обидва формати мультизначень: `category=1,2` (чіпси/js) і `category[]=` (сабміт форми) — контролер нормалізує.
- zsh-цикли з curl для тестів глючать — окремі виклики або PHP-скрипт.
