# Пошта на Hetzner для OpenCart 3 — Brevo HTTP API (глобальна процедура)

Hetzner Cloud блокує вихідні 25/465 без права розблокування (нові акаунти). Рішення для всіх OC3-проектів:

1. Адаптор `system/library/mail/brevo.php` (Mail\Brevo, HTTP API api.brevo.com/v3/smtp/email, ключ з config_mail_parameter) — джерело: repo autochemicals, гілка openCart.
2. Адмінка: Settings → Пошта → Engine "Brevo API" (опція в setting.twig), API-ключ (xkeysib-...) у "Додатковий параметр", config_email = owner@domain.
3. Домен у Brevo по API: POST /v3/senders/domains → DKIM/brevo-code/DMARC записи → Hetzner DNS API (токен: Keychain `codex.hetzner.dns`; endpoint api.hetzner.cloud/v1/zones, rrsets) + SPF include:spf.brevo.com → PUT .../authenticate → POST /v3/senders.
4. PHP 8.2+ баг OpenCart SMTP: str_split('')=[] губить порожні MIME-рядки → порожні листи. Фікс у smtp.php: `if (empty($results)) $results = array('');`.

Акаунт Brevo: pprintdim@gmail.com (free 300/день). Приклад повного проходу: autochemicals.com.ua (2026-08-12).
