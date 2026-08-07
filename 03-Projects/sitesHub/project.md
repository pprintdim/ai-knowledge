> [!note] Імпортовано з `/Users/pprintdim/Desktop/vs_projects/sitesHub/sites/project.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 0. Оригінал: untracked, видалений.

# SitesParser — технічний проєкт

Mini CRM на Laravel для автоматичного пошуку та аудиту потенційних клієнтів (український малий/середній бізнес) на послуги редизайну, SEO та розробки сайтів.

---

## 1. Мета

Отримувати максимально якісну базу українських компаній із високою ймовірністю продажу послуг, із автоматичним аудитом та персональною пропозицією, і забезпечити зручну роботу менеджера через статуси, пошук і фільтрацію.

---

## 2. Архітектура (high-level)

```
Користувач → [Новий пошук] → SearchJob
                                  │
            ┌─────────────────────┼──────────────────────┐
            ▼                     ▼                       ▼
       GoogleSearch         SiteFilter               (черга)
       (збір URL)          (відсів зайвого)
            │                     │
            ▼                     ▼
        AuditJob (на кожен сайт у черзі)
            │
   ┌────────┼─────────┬─────────────┬──────────────┐
   ▼        ▼         ▼             ▼              ▼
 SEO     Speed      UX/UI       Outdated       Contacts
 audit   (PageSpeed) (AI)        (AI)          (parser)
   │        │         │             │              │
   └────────┴────┬────┴─────────────┴──────────────┘
                 ▼
           AI: проблеми + пропозиція + probability
                 ▼
              Lead (CRM) ──→ статус auto (Good/Bad Lead)
                 ▼
        Список лідів / Картка / Фільтри / Експорт
```

Усе важке (пошук, аудит, AI) — у **чергах** (`AuditJob`), щоб UI не блокувався.

---

## 3. Модель даних

### `searches` — запуски пошуку
| поле | тип | опис |
|------|-----|------|
| id | bigint | |
| niche | string | ніша |
| city | string\|null | місто або null = вся Україна |
| limit | int | скільки сайтів знайти |
| ai_provider | enum | groq / openai |
| ai_model | string | назва моделі |
| status | enum | pending / running / done / failed |
| found_count | int | знайдено |
| created_at / updated_at | | |

### `leads` — основна сутність CRM
| поле | тип | опис |
|------|-----|------|
| id | bigint | |
| search_id | fk\|null | звідки прийшов |
| company | string | назва компанії |
| website | string | домен |
| niche | string | |
| city | string\|null | |
| telegram | string\|null | |
| phone | string\|null | |
| email | string\|null | |
| contacts_url | string\|null | сторінка контактів |
| seo_score | tinyint | 0-10 |
| speed_score | tinyint | 0-10 |
| ui_score | tinyint | 0-10 |
| outdated | enum | yes / no / partial |
| redesign_probability | tinyint | 0-100 |
| issues | json | масив проблем |
| seo_details | json | розбивка SEO-аудиту (вкл. schema/структуровані дані) |
| has_schema | boolean | наявність Schema.org розмітки |
| speed_details | json | розбивка швидкості |
| proposal | text | згенерована пропозиція |
| status | fk → statuses | |
| manager_comment | text\|null | |
| last_contacted_at | datetime\|null | |
| created_at / updated_at | | |

### `statuses` — довідник
Сід: `New, Audited, Good Lead, Bad Lead, Contacted, Повідомлено в TG, Повідомлено email, TG + email, Waiting Reply, Replied, Interested, Follow Up, Negotiation, Proposal Sent, Client, Lost, Archived`.
Поля: `id, key, label, color, sort`.

### `lead_status_history` — історія змін
| поле | тип |
|------|-----|
| id | bigint |
| lead_id | fk |
| from_status | string\|null |
| to_status | string |
| user_id | fk\|null |
| comment | text\|null |
| created_at | |

### `settings` — key/value (AI ключі, активна модель)
`provider, groq_api_key, openai_api_key, active_model`. Шифрувати ключі (`encrypted` cast).

---

## 4. Модулі

### 4.1 AI Settings (`Settings → AI`)
- Вибір Provider: **Groq** / **OpenAI**.
- Вибір Model (список залежить від провайдера, тягнеться з API).
- Поля API Key для кожного провайдера.
- Кнопки: **Test Connection**, **Save**, **Active Model**, **Switch Model**.
- Зміна моделі — без правок коду.

Контракт: `App\Services\AI\AiProvider` (interface) → `GroqProvider`, `OpenAiProvider`.
Метод `complete(prompt): string`, `models(): array`, `test(): bool`.

### 4.2 Пошук (`WebSearchService`)
- Будує запити: `site:.ua {niche} {city}`.
- Джерело: **Serper.dev** (Google-результати через простий ключ `SERPER_API_KEY`, без Google Cloud).
- Повертає список URL → передає у фільтр.

### 4.3 Фільтр сайтів (`SiteFilterService`)
**Беремо:** український бізнес, власний сайт, є Telegram у контактах, малий/середній бізнес, візитка / корпоративний / невеликий каталог / каталог із кошиком.
**Чорний список (відсів за доменом/ознаками):** Prom, Rozetka, OLX, Epicentr, великі маркетплейси та мережі, держсайти (`gov.ua`), франшизи, сайти без контактів, без Telegram.

### 4.4 Аудит

**SEO (`SeoAuditService`, 0-10):**
- **Мета/контент:** Title, Meta Description, H1, дублікати/відсутність H1, ієрархія заголовків H1-H6, обсяг контенту.
- **Структуровані дані (Schema.org):** наявність JSON-LD / microdata, типи (`Organization`, `LocalBusiness`, `Product`, `BreadcrumbList`), валідність розмітки, breadcrumbs.
- **Соц/іконки:** OpenGraph, Twitter Cards, favicon.
- **Технічне:** canonical, alt у зображень, robots.txt, sitemap.xml, meta robots (noindex/nofollow), HTTPS, mixed content, charset, `lang` / hreflang, viewport (mobile).
- **Структура/посилання:** URL structure, внутрішня перелінковка, биті посилання (404), ланцюжки редіректів.

**Швидкість (`SpeedAuditService`, 0-10):** PageSpeed Insights, Core Web Vitals, великі картинки, lazy loading, JS/CSS, кешування, стиснення, TTFB.

**UX/UI (`UxAuditService`, 0-10, AI):** сучасність дизайну, адаптивність, мобільна версія, CTA, читабельність, навігація, структура, форми, контакти.

**Моральне старіння (AI):** `сучасний / частково застарілий / морально застарілий` за ознаками (старий дизайн, дрібні кнопки, перевантаження текстом, старі слайдери, погана мобільна, застаріла структура).

### 4.5 Контакти (`ContactParser`)
Парсить зі сторінки/контактів: Telegram, телефон, email, URL сторінки контактів.

### 4.6 Генерація (AI)
- **Проблеми** — короткий список (`слабке SEO`, `застарілий дизайн`, `низька швидкість`, `слабка мобільна`, `низька конверсійність`).
- **Ймовірність продажу** — 0-100%.
- **Пропозиція** — персональний текст-звернення (укр.).

### 4.7 Автостатуси
- Новий сайт → `New`.
- Після аудиту → `Audited`.
- Багато проблем / низькі бали → `Good Lead`.
- Сучасний сайт (високі бали) → `Bad Lead`.

---

## 5. Список лідів (UI)

**Колонки таблиці:** Company, Website, Niche, City, Telegram, Phone, SEO, Speed, UI, Outdated, Probability, Status, Added, Last Action.

**Фільтри:** статус, ніша, місто, наявність Telegram, SEO Score, Speed Score, UI Score, Probability, тип сайту, дата, остання взаємодія.

**Пошук:** назва, домен, телефон, Telegram, email.

**Картка ліда:** компанія, сайт, контакти, аудит SEO, аудит швидкості, UX/UI, оцінка старіння, список проблем, персональна пропозиція, статус, коментар менеджера, історія статусів, дата останнього контакту.

---

## 6. Експорт

`maatwebsite/excel` → CSV / Excel. Набори: усі, відфільтровані, Good Lead, Contacted, Follow Up.

---

## 7. Формат збереження (JSON-контракт ліда)

```json
{
  "company": "",
  "website": "",
  "niche": "",
  "city": "",
  "telegram": "",
  "phone": "",
  "email": "",
  "seo_score": 0,
  "speed_score": 0,
  "ui_score": 0,
  "outdated": "yes/no/partial",
  "redesign_probability": 0,
  "issues": ["", "", ""],
  "proposal": "",
  "status": "new"
}
```

---

## 8. Пріоритетні ніші

клінінг, доставка, логістика, будівництво, сантехніка, кондиціонери, вентиляція, меблі, двері, вікна, спецтехніка, шиномонтаж, автосервіс, стоматології, медичні центри, бухгалтерія, юристи, друкарні, охоронні системи.

---

## 9. Етапи реалізації

| # | Етап | Зміст |
|---|------|-------|
| 1 | Каркас | Laravel, міграції, моделі, сід статусів |
| 2 | AI Settings | провайдери, Test Connection, перемикання моделей |
| 3 | Пошук + фільтр | GoogleSearch + SiteFilter, SearchJob |
| 4 | Аудит | SEO + Speed + UX/UI + Outdated + Contacts, AuditJob |
| 5 | AI-генерація | проблеми + probability + пропозиція |
| 6 | CRM UI | список, фільтри, пошук, картка, статуси, історія |
| 7 | Експорт | CSV / Excel |
| 8 | Поліш | черги, ретраї, ліміти API, логування |

---

## 10. Ризики / нотатки

- **Ліміти Google API** — кешувати результати, батчити запити.
- **Точність AI-аудиту** — UX/старіння оцінює AI за HTML+скріншотом; SEO/Speed — детерміновано.
- **Rate limits AI** — черга з backoff, зберігати сирі відповіді.
- **Дублікати лідів** — унікальність за `website` (нормалізований домен).
- **Юридичне** — парсинг публічних даних; не зберігати зайвого, поважати robots.
