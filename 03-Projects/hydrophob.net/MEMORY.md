# hydrophob.net — MEMORY

Факти для наступних задач (reusable-частина винесена в [[02-Knowledge/OpenCart3/INDEX|Knowledge]]).

- Верстку звіряти з `git show main:<файл>` (sections/*, helper/general.php — іконки, контакти).
- Патерн сторінок: route-контролер + модулі `<page>_*` через layout ([[02-Knowledge/OpenCart3/modules|modules]]); About-layout 14 ділять виробник і дилери.
- Route-слаги: `/katalog`, `/vidguky|/otzyvy`, `/poshuk`, `/kontakty`, `/koshyk|/korzina`, `/staty-dylerom|/stat-dilerom`, `/pro-vyrobnyka`; account-слаги vhid/kabinet/zamovlennia/obrane/moi-dani (+ru). Нові route → у safe-list `startup/seo_url.php`.
- Фільтри каталогу: `filter_category_ids` (IN-підзапит) + `getCategoryFilterCounts()`; URL `category=1,2` і `category[]=` обидва.
- Слайдери: єдиний hp-slider патерн (Swiper, `data-recommended-slider`, watchOverflow + lockClass).
- Товарні слаги/мета — реальні з prom.ua (26 колізій → суфікс `-<product_id>`); description-и promʼівські шаблонні, не hand-written SEO.
- Наступні етапи (з handoff 2026-08-07): OTP email-код як shokeru (фронт видобутий, бекенд писати — [[02-Knowledge/OpenCart3/ajax|ajax]]); СЕО-фільтри/пагінація/сорт у path без GET.
- Тимчасовий admin-логін admin/admin123 — змінити колись на постійний.
- ПАСТКИ деплою: rsync без `--relative` кладе плоско; гітігноровані asset-теки — окремими прямими rsync; `git add -A` без status = 1.5GB materials у коміті (вже наступали).
