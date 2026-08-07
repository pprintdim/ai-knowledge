# nadel — PROJECT

- **Repo**: локально `/Applications/MAMP/htdocs/nadel`, гілка `main` (origin GitHub)
- **Stack**: OpenCart 3.0.3.9, тема `nadel`
- **Кастомні модулі** (catalog/controller/extension/module/): about, aboutus, banner, **brief** (specbrief — анкета з полями clarify_single, attachment modes, note-система), google_auth, google_reviews, hero_video, html, production
- **Кастомні common-контролери**: burger_menu, sprite, maintenance (+ стандартні)
- **Інтеграції**: KeyCRM (brief-сабміти, secured), SMS (локалізовані шаблони, rate limiting, monitoring), Google reviews/auth
- **Свіже** (2026-08-07): OTP-логін по email-коду — на сторінці логіну і inline в checkout (патерн [[Knowledge/OpenCart3/ajax|ajax]] / shokeru)
- Активна розробка: specbrief (анкета) — довга серія комітів final_v*, SMS-хардening

handoff.md у проєкті нема — стан дивитись по git log. TASKS/DECISIONS додати при наступній реальній задачі.
