# security

- SQL injection: параметризація/escape (`$this->db->escape()` в OC3), особливо ORDER BY/LIMIT з юзер-вводу.
- XSS: escaping виводу (twig autoescape НЕ рятує від `|raw`), санітизація HTML-контенту (SVG upload — санітизувати, патерн hydrophob).
- CSRF: токени на state-changing POST; в OC3 admin — вбудований `user_token`.
- Auth/permissions: перевірка прав на кожному роуті (OC3 — `hasPermission`), не тільки в UI.
- File uploads: whitelist розширень+MIME, без виконуваних, поза web-root або deny.
- Secret leakage: git diff/історія без паролів (well: чистили історію wellua!), `.vscode/sftp.json`/config.php у .gitignore, логи без токенів.
- Shell: ніяких user-даних у команди без екранування; rm — тільки за правилами [[WORKSPACE]].
- API: підпис webhook-ів, rate limiting ([[api-integration]]; nadel: SMS rate limiting — приклад).
