# shokeru — PROJECT (проєкт-донор)

- **Локально**: `/Applications/MAMP/htdocs/shokeru` — ТІЛЬКИ `shokeru_db_backup.sql` + README (коду локально нема)
- **Живий сайт**: shokeru.in.ua — OC3, адмінка `shk_panel/`, класи `shk-*`
- **Роль**: еталон/донор перевірених рішень для натяжок (чеклист [[natyazhka-opencart]] звірявся з ним)

## Що звідси портується

- **OTP email-код** (`common/user_popup/sendCode|verifyCode`, коди в session, login override без пароля) → вже в nadel (2026-08-07), у планах hydrophob.net. Фронт: `window.ShokeruOtp`, двостадійна форма, таймер resend 60с — видобуто скрапом живого сайту.
- **Path-слаги фільтрів/пагінації/сортування** без GET (`/katalog/...`) — наступний еталон для hydrophob.net.
- **Guarded JSON_ARRAY_APPEND** для прав кастомних маршрутів ([[modules]]).
- Перейменування адмінки (`shk_panel` → патерн `<xx>_panel`).

Бекенд-код OTP локально відсутній — реалізації дивитись у nadel (свіжий порт) або писати за [[Knowledge/OpenCart3/ajax|ajax]].
