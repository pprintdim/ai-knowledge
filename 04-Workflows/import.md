# /import — імпорт даних (CSV/XML/фіди)

architect → importer → CMS-спеціаліст → qa → cleanup

1. [[architect]]: джерело, формат, ключ match-у, обсяг, разово чи cron.
2. [[importer]]: існуючі патерни проєкту СПОЧАТКУ (well: up_search_*); ідемпотентно, стрімінгом, інкрементально; вихід = скрипт + .sql (не виконувати без підтвердження!).
3. CMS-спеціаліст: специфіка таблиць ([[02-Knowledge/OpenCart3/database|OC3 database]], category_path!).
4. [[qa]]: контрольні кількості (linked/missed), випадкові одиниці очима → [[cleanup]] (дампи/tmp прибрати).
