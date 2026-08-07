> [!note] Імпортовано з `/Users/pprintdim/Desktop/vs_projects/sitesHub/sites/STRUCTURE.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 0. Оригінал: untracked, видалений.

# SitesParser — структура проєкту

Карта файлів і відповідальностей. Загальний опис — [README.md](README.md) (інструкція), [project.md](project.md) (архітектура).

---

## Дерево (ключові файли)

```
sitesParser/
├── README.md                     # інструкція користувача
├── project.md                    # технічний проєкт (БД, модулі, етапи)
├── STRUCTURE.md                  # цей файл
│
├── app/
│   ├── Http/Controllers/
│   │   ├── LeadController.php     # CRM: список, картка, статус, коментар, видалення, експорт
│   │   ├── SearchController.php   # форма «Новий пошук» + запуск RunSearchJob
│   │   └── SettingsController.php # AI Settings: save / test / список моделей
│   │
│   ├── Jobs/
│   │   ├── RunSearchJob.php       # [черга] пошук → фільтр → дедуп → створення лідів
│   │   └── AuditLeadJob.php       # [черга] аудит одного ліда + автостатус
│   │
│   ├── Models/
│   │   ├── Lead.php               # лід CRM (+ changeStatus з історією)
│   │   ├── Search.php             # запуск пошуку
│   │   ├── Status.php             # довідник статусів
│   │   ├── LeadStatusHistory.php  # історія змін статусу
│   │   └── Setting.php            # key/value налаштування (ключі шифруються)
│   │
│   └── Services/
│       ├── SiteFetcher.php        # завантаження HTML + нормалізація домену
│       ├── ContactParser.php      # Telegram / телефон / email / сторінка контактів
│       ├── WebSearchService.php   # пошук сайтів через Serper.dev
│       ├── SiteFilterService.php  # чорний список + вимога контактів/Telegram
│       │
│       ├── AI/
│       │   ├── AiProvider.php             # інтерфейс провайдера
│       │   ├── OpenAiCompatibleProvider.php # базовий клас (chat/completions)
│       │   ├── GroqProvider.php           # Groq
│       │   ├── OpenAiProvider.php          # OpenAI
│       │   └── AiManager.php               # фабрика: активний провайдер/модель (БД→.env)
│       │
│       └── Audit/
│           ├── SeoAuditService.php   # SEO 0-10 (19 перевірок + Schema.org), детерміновано
│           ├── SpeedAuditService.php # швидкість 0-10 (PageSpeed або евристика)
│           └── AiAuditService.php    # UX/UI, старіння, проблеми, ймовірність, пропозиція (AI)
│
├── config/
│   └── sitesparser.php            # AI, Google Search, PageSpeed, чорний список, ніші, пороги
│
├── database/
│   ├── migrations/2026_06_10_0000*  # statuses, searches, leads, lead_status_history, settings
│   └── seeders/
│       ├── StatusSeeder.php       # 14 статусів
│       └── DatabaseSeeder.php     # статуси + тестовий користувач
│
├── routes/web.php                 # усі маршрути
│
└── resources/views/
    ├── layouts/app.blade.php      # каркас (sidebar, Tailwind+Alpine через CDN)
    ├── leads/index.blade.php      # таблиця лідів: фільтри, пошук, експорт, видалення
    ├── leads/show.blade.php       # картка ліда: аудит, пропозиція, статус, історія
    ├── searches/create.blade.php  # форма нового пошуку
    └── settings/ai.blade.php      # налаштування AI
```

---

## Потік даних

```
SearchController@store
   └─ створює Search (status=pending)
   └─ dispatch RunSearchJob ──────────────────────────────► [ЧЕРГА]

RunSearchJob (handle)
   ├─ WebSearchService.search()         → список URL (Serper.dev)
   ├─ для кожного URL:
   │    ├─ SiteFilterService.isAllowedDomain()   (чорний список)
   │    ├─ дедуп по домену (leads.website)
   │    ├─ SiteFetcher.fetch()                   → HTML
   │    ├─ ContactParser.parse()                 → telegram/phone/email/contacts_url
   │    ├─ SiteFilterService.passesContent()     (Telegram обовʼязковий)
   │    ├─ дедуп по телефону / email
   │    └─ Lead::create (status=New)
   │         └─ dispatch AuditLeadJob ───────────► [ЧЕРГА]
   └─ Search.status = done (found_count)

AuditLeadJob (handle)
   ├─ SiteFetcher.fetch()
   ├─ SeoAuditService.audit()    → seo_score + seo_details + has_schema
   ├─ SpeedAuditService.audit()  → speed_score + speed_details
   ├─ AiAuditService.analyze()   → ui_score, outdated, issues, probability, proposal
   ├─ Lead.update(...)
   └─ автостатус: Good Lead / Bad Lead / Audited   (за config thresholds)

Менеджер (UI)
   ├─ LeadController@index   → список + фільтри/пошук
   ├─ LeadController@show    → картка
   ├─ @updateStatus / @updateComment → робота зі статусами (+ історія)
   ├─ @destroy               → видалення
   └─ @export                → CSV
```

---

## Таблиці БД

| Таблиця | Призначення |
|---------|-------------|
| `searches` | запуски пошуку (ніша, місто, ліміт, AI, статус) |
| `leads` | основна сутність CRM (контакти, оцінки, issues, proposal) |
| `statuses` | довідник 14 статусів |
| `lead_status_history` | історія змін статусу ліда |
| `settings` | key/value (AI ключі — шифровані, активна модель) |

---

## Точки розширення

| Що додати | Де |
|-----------|----|
| Новий AI-провайдер | `app/Services/AI/` → реалізувати `AiProvider`, додати в `AiManager::PROVIDERS` |
| Нова SEO-перевірка | `SeoAuditService::audit()` — додати в масив `$checks` |
| Інше джерело пошуку | новий сервіс за зразком `WebSearchService`, виклик у `RunSearchJob` |
| Нові правила фільтра | `config/sitesparser.php` → `filter.*` |
| Пороги автостатусу | `config/sitesparser.php` → `thresholds` |
| Експорт у Excel (xlsx) | `LeadController::export()` (зараз CSV; можна підключити maatwebsite/excel) |
