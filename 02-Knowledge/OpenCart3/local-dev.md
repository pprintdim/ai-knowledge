# Локальна розробка OpenCart-проєктів (MAMP) — стандарт (2026-08-20)

Правило користувача (стосується ВСІХ OpenCart-проєктів, включно з натяжками):
локалка існує для тестів; максимально просто.

- **Файли** — локально, у `/Applications/MAMP/htdocs/<проєкт>/<домен>`; кожен сайт на своєму порту MAMP (vhost у `conf/apache/extra/httpd-vhosts.conf` + `Listen` у `httpd.conf`): 8890 hydrophob.net, 8891 hydrophob.ua, 8892 hydrophob.com.ua.
- **БД одна — серверна** (не дублювати локально): SSH-тунель `127.0.0.1:3307 → 46.224.100.254:3306`, тримає LaunchAgent `com.pprintdim.hetzner-mysql-tunnel` (скрипт `~/AI-Workspace/scripts/hetzner-mysql-tunnel.sh`, пароль з Keychain `codex.ssh.hydrophob-cloudpanel`). У config.php: `DB_HOSTNAME 127.0.0.1`, `DB_PORT 3307`, юзер/пароль серверні. Латентність ~44мс/запит → сторінки OC вантажаться секунди; для тестів ок. FastCGI idle-timeout у MAMP піднятий до 300с (`FastCgiServer ... -idle-timeout 300`).
- **Картинки і все важке — тільки на сервері**: `image/catalog`, `image/cache` не тягнути. Локально фолбек: константа `DEV_IMAGE_FALLBACK` у config.php (лише локальному) + патч `catalog/model/tool/image.php` і `<адмінка>/model/tool/image.php` (якщо файла нема — повертає прод-URL кешованої картинки; на проді константа не визначена — патч сплячий, можна деплоїти) + rewrite в vhost: відсутні `/image/*` → 302 на прод.
- **rsync з сервера**: `--exclude image/catalog --exclude image/cache --exclude 'storage/{cache,session,logs}/*'`.
- **config.php / <адмінка>/config.php** — у `.gitignore`, локальний і серверний різні.
- **Адмінка** — тека `hp_panel` (не `admin`), як у всіх hydrophob-проєктів; + панелька Кеш/Модифікатори в хедері (controller/common/refresh.php) + drag&drop лояутів (layout_form.twig) — еталон hydrophob.net.
