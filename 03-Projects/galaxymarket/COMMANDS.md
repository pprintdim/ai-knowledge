# galaxymarket — команди локального розгортання (MAMP)

Проєкт: Drupal 10.6 (composer, web-root = корінь репо). Локально: `/Applications/MAMP/htdocs/galaxymarket`, repo `git@github.com:YakovDY/galaxymarket.git`.
Гілки: `master` = прод (push → CI/CD авто-деплой на Mirohost), робоча — `redesign`.

## 0. Git
```bash
cd /Applications/MAMP/htdocs/galaxymarket
git checkout redesign            # робоча гілка
git fetch origin && git rebase origin/master   # підтягнути прод-зміни
# мердж у master — ТІЛЬКИ після перевірки й команди власника
```

## 1. PHP / Composer
Composer.lock допускає PHP ≤ 8.4 (prophecy, laminas-feed) — 8.5 НЕ проходить. MAMP Apache крутить PHP через `/Applications/MAMP/fcgi-bin/php.fcgi` (зараз 8.3.30 — ок, нічого перемикати не треба; симлінк `bin/php/php` на Apache не впливає). Для CLI (composer/drush) використовувати `php8.4.17`.
Встановити core/vendor/contrib (не в git):
```bash
/Applications/MAMP/bin/php/php8.4.17/bin/php /Applications/MAMP/bin/php/composer install --no-interaction --prefer-dist
```

## 2. База даних (MAMP MySQL 8.0, root/root, сокет `/Applications/MAMP/tmp/mysql/mysql.sock`)
Дамп: `materials/galaxymarket.sql.zip` (149 МБ sql, з mirohost MariaDB 10.11).
```bash
MYSQL=/Applications/MAMP/Library/bin/mysql80/bin/mysql
SOCK=/Applications/MAMP/tmp/mysql/mysql.sock

$MYSQL -uroot -proot -S $SOCK -e "CREATE DATABASE IF NOT EXISTS galaxymarket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;"
unzip -p materials/galaxymarket.sql.zip galaxymarket.sql | $MYSQL -uroot -proot -S $SOCK --default-character-set=utf8mb4 galaxymarket
```
Перевірка:
```bash
$MYSQL -uroot -proot -S $SOCK -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='galaxymarket';"
```

## 3. settings.local.php (гітігнорований, `sites/default/settings.local.php`)
```php
<?php
$databases['default']['default'] = [
  'database' => 'galaxymarket',
  'username' => 'root',
  'password' => 'root',
  'host' => 'localhost',
  'port' => '8889',
  'unix_socket' => '/Applications/MAMP/tmp/mysql/mysql.sock',
  'driver' => 'mysql',
  'prefix' => '',
  'collation' => 'utf8mb4_unicode_520_ci',
];
$settings['hash_salt'] = '<згенерувати: openssl rand -hex 32>';
$settings['trusted_host_patterns'] = ['^localhost$', '^127\.0\.0\.1$'];
$settings['config_sync_directory'] = 'config/sync';
$config['system.logging']['error_level'] = 'verbose';
$settings['skip_permissions_hardening'] = TRUE;
```

## 4. Drush після імпорту
```bash
DRUSH="/Applications/MAMP/bin/php/php8.4.17/bin/php vendor/bin/drush"
$DRUSH status
$DRUSH updatedb -y
$DRUSH config:import -y      # конфіг у репо (config/sync) — source of truth, як на проді
$DRUSH cache:rebuild
$DRUSH uli --uri=http://localhost:8888/galaxymarket   # одноразовий логін в адмінку
```

## 5. Файли
`sites/default/files/` не в git — забрати з проду окремо (rsync/архів), інакше картинки будуть биті.

## 6. Відкрити
http://localhost:8888/galaxymarket/ (MAMP Apache, DocumentRoot = htdocs; RewriteBase не потрібен — перевірено 2026-09-10).
Basic-auth у тракнутому `.htaccess` обгорнуто в `<IfFile /var/www/.../.htpasswd>` (коміт 7aa2381 у `redesign`) — локально пропускає, на проді працює як раніше.

## Стан 2026-09-10
Локалка розгорнута повністю: composer install (Drupal 10.6.14), БД імпортовано (247 таблиць), settings.local.php, updatedb + config:import + cr — сайт віддає 200. Немає лише `sites/default/files/` з проду (картинки биті).

## Прод-деплой (для довідки, робить CI)
`.github/workflows/deploy.yml` → по SSH на прод `scripts/deploy/prod-deploy.sh`: config-guard → бекап БД → `git reset --hard origin/master` → `composer install --no-dev` → `drush updatedb / config:import / cache:rebuild`.
