# TASKS — starlife

## Відкриті
- [ ] Користувач: видалити старий репо `pprintdim/starlife` на GitHub (Settings → Danger Zone) або дати `gh auth login`
- [ ] Рубрики постів відключені в functions.php — картки блогу показують фолбек «Матеріал»; повернути таксономію, коли клієнт почне вести блог

## Закриті (2026-10-09)
- [x] ДЕПЛОЙ НА ПРОД виконано (вечір 2026-10-09): git-схема — bare-репо `/home/starlifenet/repo/startlife.git` на сервері, локальний remote `prod`; деплой = `git push prod main` + на сервері `GIT_DIR=~/repo/startlife.git GIT_WORK_TREE=~/htdocs/starlife.net.ua git checkout -f main`. Прод-БД: legal-сторінки оновлено (3/66/68), створено cookies(105) і Блог(106)=page_for_posts, permalinks флашнуто. УВАГА: ядро WP у репі тепер 7.1.3 = прод (перший checkout відкотив 6.9.1 — виправлено з бекапу; перед майбутніми деплоями звіряти версію ядра!). Плагіни wp-mail-smtp і wps-hide-login живуть ТІЛЬКИ на проді (не в репо) — git clean на сервері НЕ ганяти
- [x] Порт оновленого lovable-дизайну: лого партнерів, нав 7 пунктів, #catalog (45 продуктів 5 компаній, фільтр тегів), #documents (3 брошури + офіційні PDF), PDF-кнопки на напрямах
- [x] Велком-тизер як у hydrophob: прелоадер+друкування+звук по жесту, кука sl_welcome (4/міс, пауза 6 год), відео = прод video-hero.mp4 стиснуте в тему (25MB десктоп / 10.5MB мобайл, assets/video/)
- [x] WP main → репо startlife, origin перемкнуто
- [x] Lovable розгорнуто локально (worktree lovable-app, порт 5181)
- [x] Редизайн теми за Lovable-дизайном + sl_* кастомні поля (commit a588963, запушено)
- [x] Локальний рантайм у MAMP відновлено (wp-config-local.php, БД starlife)
- [x] Оригінальний контент вшито: секція «Страхові продукти» (product CPT + insurance_repeater, 44 програми з PDF), тарифи з pdf_file, 3 офіційні PDF у секції й футері, оригінальні тексти про/місія (commit 2b1bbbe)
- [x] Блог: home.php + single.php у новому стилі, лендинг-картки лінкують на пости; сторінка «Блог» (id 93) = page_for_posts
- [x] Legal-сторінки в локальній БД: privacy-policy(3)/terms(66)/accessibility-statement(68)/cookies(92) з текстами дизайну + шаблон page-legal.php; .htaccess зроблено портативним для підтеки
