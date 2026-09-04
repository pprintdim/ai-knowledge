# hydrophob.net — TASKS

## Активні
- [ ] Задеплоїти: лінки плиток мозаїки, відео-модуль, AJAX-пагінація відгуків
- [ ] Рознести відео по сайту (промо на «про виробника», інструкції на товарах, головна/дилери)
- [ ] Локалізувати хардкод у шаблонах: checkout 56, product 28, contacts 16, header 16, footer/account 10, search/cart 9
- [ ] RU-пости блогу — зараз копії UK, треба переклад (content-translator)
- [ ] max-age статики — заблоковано, треба root/CloudPanel
- [ ] Змінити тимчасовий admin-пароль (<REDACTED→secrets/ACCESS.md>)
- [ ] Задеплоїти на прод коміт da9ff2d (категорії → 301 на /katalog) + перевірити старі категорійні URL і sitemap на живому

## Завершені (ключове)
- [x] Категорії без окремих сторінок: 301 на `/katalog?category=N`, викинуті з sitemap, крихти товару Головна//Каталог (da9ff2d, 2026-08-07)
- [x] Локальне середовище після переїзду тек: vhost 8890 + config.php/hp_panel/config.php на `/hydrophob/hydrophob.net/`
- [x] `maket/` лишається в hydrophob.net (не в спільній materials) і додано в .gitignore — 1.1 ГБ PSD (ff896fc)
- [x] OTP email-код на логіні та в чекауті (d5c3c93)
- [x] СЕО-фільтри/пагінація/сортування в path без GET (cefe258)
- [x] Головна повністю модульна + shop/search секції через layouts (73be0ea)
- [x] Checkout 1:1 з main — коміт 9a07049, E2E на проді
- [x] SEO URL всюди (93 рядки oc_seo_url, route-слаги, 301-канонікалізація)
- [x] Мови uk+ru повністю (129 файлів + контент БД)
- [x] Прод-міграція sectional-PHP → OpenCart (2026-08-04)
