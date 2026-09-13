# stores.crm — стан (оновлено 2026-09-13)

- Прод: `https://46.224.100.254:8442/crm/`, код у `/home/storescrm/app` (НЕ git — деплой `deploy/deploy.sh` з репо, tar по SSH від root; `--migrate` = міграції). Фронт збирати: `VITE_BASE_PATH=/crm NITRO_APP_BASE_URL=/crm npx vite build`.
- 2026-09-13: додано шар спільної ідентичності клієнтів групи (сторінка «Клієнти групи», API для магазинів, `group:sync` щогодини). Деталі й відхилення від плану — `02-Knowledge/OpenCart3/group-identity-plan.md`, розділ «Як зроблено».
- Підключення магазину до групи: CRM → «Клієнти групи» → «Магазини» → додати (key, назва, домен, base_url) → токен → у `config.php` магазину: `GROUP_API_URL='https://46.224.100.254:8442/crm/api/group'`, `GROUP_API_TOKEN`, `GROUP_API_INSECURE=true` → «Повна звірка».
- Поточні магазини групи Hydrophob: hydrophob.net, hydrophob.ua, hydrophob.net.ua (лендінг hydrophob.com.ua без кабінету — не підключений).
- Токени магазинів — тільки в БД CRM (зашифровано) і в `config.php` магазинів; у чаті/репо/нотатках не зберігати.
