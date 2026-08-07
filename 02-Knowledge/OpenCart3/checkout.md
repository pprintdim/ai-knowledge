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
