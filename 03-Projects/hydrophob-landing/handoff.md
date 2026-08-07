> [!note] Імпортовано з `/Applications/MAMP/htdocs/hydrophob-landing/handoff.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 0. Оригінал: untracked, видалений.

# Handoff — hydrophob-landing

Знімок стану роботи. Gitignored — не комітиться.

## Сервер (VPS, новий, під деплой hydrophob.net.ua)

- IPv4: 46.224.100.254/32
- IPv6: 2a01:4f8:c010:aba9::/64
- Hostname: ubuntu-4gb, Ubuntu 24.04.4 LTS, диск 74.78GB, RAM 5% used
- SSH user: root
- SSH пароль (АКТУАЛЬНИЙ, змінено 2026-07-26 з тимчасового): <REDACTED→secrets/ACCESS.md>
- Домен: hydrophob.net.ua — DNS переведено користувачем на Hetzner NS (oxygen/hydrogen/helium.ns.hetzner.*), A-запис → 46.224.100.254. Перевірено 2026-07-26, сайт публічно доступний.
- Панель керування: CloudPanel

## CloudPanel — доступ до адмінки (мультиадмін, 2026-07-26)

- `https://46.224.100.254:8443` (self-signed) → `master-admin` / `<REDACTED→secrets/ACCESS.md>` — універсальний, бачить усі сайти (перейменовано з hydrophob-admin 2026-07-26, стара назва вводила в оману на мультисайтовому сервері)
- `https://hydrophob.net.ua:8443` (валідний SSL) → `hydrophob-manager` / `<REDACTED→secrets/ACCESS.md>` — тільки hydrophob.net.ua
- `https://shokeru.in.ua:8443` (валідний SSL) → `shokeru-manager` / `<REDACTED→secrets/ACCESS.md>` — тільки shokeru.in.ua
- `https://hydrophob.net:8443` (валідний SSL) → `hydrophobnet-manager` / `<REDACTED→secrets/ACCESS.md>` — тільки hydrophob.net
- Новий домен на сервері → `clpctl user:add --role=user --sites=domain.tld`, заходити через `https://domain.tld:8443`
- SSL панелі: симлінк /home/clp/services/nginx/ssl-certificates/{cert.crt,private.key} → /etc/nginx/ssl-certificates/hydrophob.net.ua.{crt,key} (автопродовження разом з сайтом). Бекап self-signed: *.selfsigned.bak поруч.

## Сайт у CloudPanel

- Домен сайту: hydrophob.net.ua
- Site user (SFTP/SSH до сайту): hydrophob
- Site user пароль: <REDACTED→secrets/ACCESS.md>
- PHP 8.3, vhost template Generic

## Поточний стан

- SSH-доступ підтверджено, root-пароль змінено (вище).
- CloudPanel встановлено, admin-юзер і PHP-сайт для hydrophob.net.ua створені.
- Код задеплоєний через rsync (без materials/, downloaded-images/, .git), .env перенесений вручну, права виставлені (chown hydrophob:hydrophob, 750/640).
- Сайт публічно живий на https://hydrophob.net.ua/ — HTTP 200, справжній Let's Encrypt сертифікат (не самопідписаний).
- Видалено з сервера невикористані файли: README.md, .htaccess (мертвий під nginx), 6 продуктових фото (KOV*.webp, oval.svg), 3 відео-рілси без посилань у коді. 247MB → 192MB. Локально в репо ці файли НЕ чіпав (тільки серверна копія).
- ВАЖЛИВО: sshd на сервері захищений <REDACTED→secrets/ACCESS.md> — кілька невдалих спроб паролю банять IP на SSH (порт 22, HTTP/HTTPS не зачіпає). Якщо забанило — або чекати (звичний бан ~10-30 хв), або VPN/зміна IP, або Hetzner Robot → Rescue System (окрема мережева ОС в обхід <REDACTED→secrets/ACCESS.md>).
- SEO-файли (data/seo.json, sitemap.xml, robots.txt) виправлені на hydrophob.net.ua.
- nginx-конфіг сайту (/etc/nginx/sites-enabled/hydrophob.net.ua.conf) доповнено вручну: rewrite для /privacy, /returns, /offer → legal.php?p=X (аналог старого .htaccess), error_page 404 → 404.php, catch-all замінено з `/index.php?$args` на справжню `=404` (щоб неіснуючі URL не віддавали 200 з головною сторінкою). Перевірено curl — всі роути ОК.
- УВАГА: якщо в CloudPanel UI змінювати Vhost/SSL сайту — може перегенерувати цей файл і стерти кастомні rewrite-правила. Якщо після зміни SSL /privacy тощо перестануть працювати — треба знову додати ці 3 блоки (rewrite + error_page + try_files =404) в /etc/nginx/sites-enabled/hydrophob.net.ua.conf, секція `server { listen 8080 ... }`.

- **hydrophob.net** — порожня заглушка, 2026-07-26. DNS вже вказував на сервер, SSL встановлено одразу.
  - SFTP/SSH: user `hydrophobnet`, пароль у /private/tmp scratchpad цієї сесії (не збережений тут, скинути за потреби через CloudPanel UI).
  - Корінь: `/home/hydrophobnet/htdocs/hydrophob.net/`. Контенту немає — дефолтна CloudPanel-заглушка.

- **sites.pprintdim.com — НЕ hydrophob**, це окремий проєкт (sitesHub CRM prom+sites). Помилково задеплоїв сюди hydrophob-landing 2026-07-26, потім виправив: видалив той сайт (`clpctl site:delete`) і на цьому ж VPS підняв sitesHub CRM (деталі — `sitesHub/handoff.md`). hydrophob-landing НЕ живе на sites.pprintdim.com — тільки на hydrophob.net.ua.

## Незакриті задачі

- [x] Перевірити DNS hydrophob.net.ua → зараз НЕ на новий сервер, треба міняти в реєстратора
- [x] Встановити CloudPanel на сервері
- [x] Створити vhost/сайт для hydrophob.net.ua в CloudPanel
- [x] Залити код проєкту (rsync), виключено зайве
- [x] Перенести `.env` на сервер (не з git, вручну)
- [x] Виправити старий домен html.pprintdim.com на hydrophob.net.ua в data/seo.json, sitemap.xml, robots.txt — задеплоєно, перевірено curl (canonical/og:url коректні)
- [x] SSL (Let's Encrypt через CloudPanel) — встановлено, перевірено (CN=hydrophob.net.ua, issuer Let's Encrypt)
- [x] Користувач змінив DNS (Hetzner NS) — сайт публічно живий

## Нюанси

- Раніше був окремий SFTP-хостинг (див. `project.md`, журнал 2026-07-15) — це інший сервер, не плутати.
- `project.md` — секрети туди НЕ писати, тільки сюди (handoff.md).
