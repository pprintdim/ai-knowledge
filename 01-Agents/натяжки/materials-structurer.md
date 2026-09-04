# materials-structurer

**Визначення**: `~/.claude/agents/materials-structurer.md` · модель: sonnet · інструменти: файли+bash

Структурує сирі клієнтські матеріали (макети, фото, тексти docx, лого, етикетки) в чисту `structured/` + `products.json` + `site-texts/*.json` по секціях макета. Еталон результату: `/Applications/MAMP/htdocs/realChem/materials/structured/`.

## Коли використовувати
- Користувач надає "всиру" папку матеріалів нового сайту (початок натяжки).
- Обʼємно і механічно: багато файлів, дублікати, кирилічні імена, docx-тексти.

## Що знає патерн
- Оригінал read-only; результат — окрема `structured/` поруч. Нічого не видаляти в джерелі.
- Дедуплікація: md5 + дати, береться найновіша ітерація (напр. Fin#3 з Fin#1..3); відсіяне — у звіт.
- Базова структура: `makety/pc|mob|jpg`, `fonts/`, `logo/` (по версіях), `product-images/<slug>/` (латиницею, `<slug>-N.jpg`), `section-images/` (instagram/іконки/банери), `labels/`, `texts/` (site/, descriptions/, instructions-final/, *-drafts/).
- Кирилиця → латиниця (lowercase, дефіси) для всього, що піде у верстку.
- `products.json`: `id, slug, name, category, volume, description, characteristics[], images[]`; docx читати `textutil -convert txt -stdout`; після запису python-перевірка (валідність + існування images).
- `site-texts/*.json`: секції 1:1 з макетом (jpg-макети дивитись через Read): `common.json`, по файлу на сторінку, `product-card.json` (ключ = slug; purpose/usage/composition/volume з інструкцій). Де в макеті lorem — писати з матеріалів і позначати `"_source": "generated"`; факти (телефони/адреси/ціни) НЕ вигадувати — тільки з макета з позначкою «уточнити».
- `README.md` у structured/: таблиця структури, мапа «сторінка макета → контент», список прогалин для клієнта.

## Промпт-заготовка
```
Структуризуй сирі матеріали <шлях до сирої папки> у <шлях>/structured/.
Оригінал не чіпати. Патерн realChem: дедуп по md5/датах (найновіша версія),
makety/fonts/logo/product-images(латиницею)/section-images/labels/texts,
products.json + site-texts/*.json по секціях макета, README з мапою і прогалинами.
Мова текстів: <мова джерел>. Звіт: дерево, обсяги, відсіяні дублі, прогалини.
```

## Після агента (оркестратор)
1. Переглянути дерево structured/ і README (мапа + прогалини).
2. Вибіркова перевірка: products.json (шляхи images), 2–3 site-texts проти jpg-макетів.
3. Список прогалин → користувачу (запросити у клієнта відео/моб-макети/фото/реальні контакти).
