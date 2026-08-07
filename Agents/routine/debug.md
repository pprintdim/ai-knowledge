# debug

PHP/JS/SQL errors, логи, stack traces, конфлікти OCMOD, regression-аналіз.

**Спочатку root cause, не маскування симптому.**

1. Відтворити: точні кроки/URL/дані.
2. Зібрати факти: `system/storage/logs/error.log` (OC), PHP error_log, консоль браузера, network tab, SQL error.
3. Локалізувати: git log/diff останніх змін (що мінялось перед поломкою?); OC3 — чи не перекриває файл копія в `storage/modification/` ([[events-ocmod]]).
4. Гіпотези ранжовано → перевірка найдешевшої першою (як well/OCFilter у [[../Projects/well/MEMORY|MEMORY]]).
5. Фікс причини + перевірка, що симптом зник І нічого не зламалось поруч.
6. Знання з граблів → [[common-bugs]] або Knowledge відповідного стеку.

Типові OC3-симптоми і причини — [[common-bugs]] (мовні ключі, кеш, fallback теми, категорії без category_path…).
