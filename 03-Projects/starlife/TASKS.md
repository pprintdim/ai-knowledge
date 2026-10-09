# TASKS — starlife

## Відкриті
- [ ] Користувач: видалити старий репо `pprintdim/starlife` на GitHub (Settings → Danger Zone) або дати `gh auth login`
- [ ] Деплой на прод starlife.net.ua — користувач сказав «поки не заливай на сервер» (2026-10-09); деплоїти через репо startlife гілка main (git-based). Після деплою: прод-БД — ті самі зміни, що зроблені локально (legal-сторінки + шаблон, сторінка «Блог» + page_for_posts), і перегенерувати permalinks
- [ ] Рубрики постів відключені в functions.php — картки блогу показують фолбек «Матеріал»; повернути таксономію, коли клієнт почне вести блог

## Закриті (2026-10-09)
- [x] WP main → репо startlife, origin перемкнуто
- [x] Lovable розгорнуто локально (worktree lovable-app, порт 5181)
- [x] Редизайн теми за Lovable-дизайном + sl_* кастомні поля (commit a588963, запушено)
- [x] Локальний рантайм у MAMP відновлено (wp-config-local.php, БД starlife)
- [x] Оригінальний контент вшито: секція «Страхові продукти» (product CPT + insurance_repeater, 44 програми з PDF), тарифи з pdf_file, 3 офіційні PDF у секції й футері, оригінальні тексти про/місія (commit 2b1bbbe)
- [x] Блог: home.php + single.php у новому стилі, лендинг-картки лінкують на пости; сторінка «Блог» (id 93) = page_for_posts
- [x] Legal-сторінки в локальній БД: privacy-policy(3)/terms(66)/accessibility-statement(68)/cookies(92) з текстами дизайну + шаблон page-legal.php; .htaccess зроблено портативним для підтеки
