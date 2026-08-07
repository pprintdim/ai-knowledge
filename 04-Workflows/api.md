# /api — зовнішня інтеграція

api-integration → backend-php → qa

1. [[api-integration]]: rate limits/retries/errors/idempotency чек; існуючі реалізації в Projects СПОЧАТКУ (nadel: KeyCRM; hydrophob: WayForPay).
2. [[backend-php]]: вбудова в проєкт, конфіг без секретів у git/vault.
3. [[qa]]: обробка збоїв API (таймаут/429/5xx), webhook-підписи ([[security]] за потреби).
