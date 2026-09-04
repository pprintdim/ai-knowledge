# OC3 — checkout (оркестрація стокових ендпоінтів)

Кастомний односторінковий checkout НЕ переписує логіку — фронт fetch-ланцюгом оркеструє стокові контролери. Перевірено E2E на проді (hydrophob.net, коміт 9a07049).

## Ланцюг guest

1. `checkout/guest/save` — POST усіх полів; **обовʼязково `shipping_address=1`**, інакше shipping-адреса не ставиться в session.
2. **GET `checkout/shipping_method`** — наповнює session quotes. Без цього кроку save падає «оберіть спосіб доставки».
3. `checkout/shipping_method/save`
4. GET `checkout/payment_method`
5. `checkout/payment_method/save`
6. GET `checkout/confirm` — **саме тут створюється order**
7. POST `extension/payment/<code>/confirm` → success

## Ланцюг logged

Замість guest/save: `checkout/payment_address/save` + `checkout/shipping_address/save` з тими самими полями; далі кроки 2–7 ідентичні.

## Супутнє

- Платежі мінімум: cod + bank_transfer + free_checkout; решту видаляти ([[modules]] — чистка стока + oc_extension).
- Доставки: flat + кастомний `delivery` (НП/УП/Meest/курʼєр/самовивіз в одному getQuote) — патерн hydrophob.net.
- Права: `extension/shipping/*` роути додати в `oc_user_group` (guarded JSON_ARRAY_APPEND, [[modules]]).
- Кошик: hp-степер на стокових `cart/edit`/`cart/remove`; без попапів — тільки бейдж. Кнопка товару: стан «Додано» → відкриває кошик (server-side in_cart + client switch).
- Тестові замовлення після E2E-перевірки видаляти з БД (обидві, якщо локал+прод).

## Досвід hydrophob.net.ua (2026-09-01)

- **Примусова авторизація в чекауті** (config_checkout_guest вимкнено): OTP-тип
  `checkout` у `common/user_popup` — існуючий email логіниться, новий реєструється
  даними з форми чекауту (`addCustomer` + `login($email,'',true)` override).
  В otp.js — програмний `window.hpOtpStart(payload, onDone)`: після verify не
  редіректимо, а віддаємо колбек, який жене logged-ланцюг (payment_address/save →
  shipping_address/save → …). Кнопку сабміту на час введення коду розблокувати.
- **Мовні ключі свого чекауту префіксувати** (`co_*`): стокові `entry_city`,
  `error_city`, `text_payment` тощо ВЖЕ зайняті в checkout/checkout.php мовних
  файлах — перезапис ламає інші сторінки.
- **Одне поле призначення** замість «відділення + адреса»: label/placeholder
  міняються від способу отримання (`branch/postomat/courier`), автокомпліт
  вмикається лише для branch/postomat (`data-suggest="0"` на courier). Способи
  отримання — карта `DEST_TYPES[carrier]`; для самовивозу поля чистяться і
  втрачають required.
- **WayForPay** у ланцюгу: після confirm — GET `extension/payment/wayforpay/confirm`,
  потім у HTML confirm шукати `#wayforpay_submit` і сабмітнути; для офлайн-оплат —
  POST `extension/payment/<code>/confirm` → редірект на success.
- **E2E з OTP локально**: `session_engine=db` — код із сесії дістається тільки
  SELECT-ом з `oc_session` (правило підтвердження БД діє). Файлових сесій нема.
- **Плейсхолдери глобально**: стоковий reset теми може фарбувати
  `input::placeholder` у колір/вагу тексту — плейсхолдер має бути сірим і 400.
- **Затемнення поверх хедера**: хедер зі своїм z-index — окремий stacking context;
  глобальний overlay його не накриє. Рішення — другий шар `::after` всередині
  `.header` + підняти активний елемент (пошук) z-index-ом у межах хедера.
