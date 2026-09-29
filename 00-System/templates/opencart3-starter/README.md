# Стартовий набір OpenCart 3

Те, що доводилось писати наново в кожній натяжці. Файли взяті з hydrophob.net
(перший доведений до кінця проєкт групи) і вже обкатані на чотирьох сайтах.

Копіювати ОДРАЗУ при створенні гілки CMS, до порту першої секції — інакше
доведеться вертатись і переробляти вже написані модулі під ці конвенції.

## Що куди

| Файл набору | Куди в проєкті | Навіщо |
|---|---|---|
| `catalog/model/tool/poster.php` | так само | постер відео = кадр із самого ролика, кеш за шляхом+секундою+mtime |
| `catalog/model/tool/video_mobile.php` | так само | легка копія ролика для телефона: ffmpeg у фоновій черзі під flock |
| `catalog/controller/event/video_mobile.php` | так само | підміна джерела на телефоні на виході кожного шаблону |
| `catalog/controller/startup/theme_settings.php` | так само | підставляє відсутні `theme_<тема>_*` зі стокової групи |
| `system/library/mail/brevo.php` | так само | пошта через HTTP API (SMTP на Hetzner закритий) |
| `admin/controller/common/refresh.php` | `<admin>/controller/common/` | дропдаун «Кеш» у шапці адмінки |
| `admin/controller/common/filemanager.php` + `admin/view/template/common/filemanager.twig` | `<admin>/…` | медіатека: сітка карток, сортування, відео, службові теки приховані |
| `admin/view/javascript/hydro-*.js`, `admin/view/stylesheet/hydro-repeater.css` | `<admin>/view/…` | єдиний вигляд форм модулів |
| `deploy.sh.example` | корінь проєкту, перейменувати в `deploy.sh` | rsync на прод; у `.gitignore`, бо містить пароль |
| `snippets/*` | вставити в наявні файли | реєстрація startup/подій, гейт індексації, підключення hydro-* |

## Порядок установки

1. Скопіювати файли за таблицею; у `<admin>` підставити реальну теку адмінки.
2. `snippets/system-config-catalog.php` — перенести обидва масиви у
   `system/config/catalog.php`.
3. `snippets/admin-header-includes.twig` — додати в `<head>` шапки адмінки.
4. `snippets/noindex-gate.php` — метод `robots()` у `catalog/controller/common/header.php`
   плюс чекбокс `config_noindex` у Налаштування → Сервер.
5. `deploy.sh`: підставити site user, домен, пароль; перевірити `--dry-run`.
6. Перевірити, що `ffmpeg` і `ffprobe` є на сервері (`command -v ffmpeg`), інакше
   постери й мобільні копії просто не створяться (сайт від цього не падає).

Повний опис робочого процесу натяжки — `02-Knowledge/OpenCart3/starter-kit.md`.
