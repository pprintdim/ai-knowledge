# hydrophob.net — PROJECT

- **Repo**: `git@github.com:pprintdim/hydrophob.net.git`, локально `/Applications/MAMP/htdocs/hydrophob.net`
- **Stack**: OpenCart 3.0.3.9, тема `hydrophob` (копія default, hp-* класи), PHP 8.3 (локал MAMP = прод FPM)
- **Гілки**: `openCart` — ПРОД (живий магазин); `main` — sectional-PHP еталон верстки (історичний, джерело дизайну); `lovable` — Lovable-редактор, не чіпати
- **Прод**: VPS `46.224.100.254` (CloudPanel), site user `hydrophobnet`, root `/home/hydrophobnet/htdocs/hydrophob.net/`, nginx (НЕ Apache — .htaccess ігнорується), БД `hydrophobnet-oc`
- **Адмінка**: `hp_panel/` (перейменована з admin/)
- **Локал**: `http://localhost:8890/` (окремий vhost, root = тека проєкту — ЧПУ працюють)
- **Мови**: uk (дефолт, id=1) + ru (id=3), en вимкнена
- **E-commerce**: платежі cod/bank_transfer/free_checkout; доставки flat + кастомний `delivery` (НП/УП/Meest/курʼєр/самовивіз); односторінковий hp-checkout ([[Knowledge/OpenCart3/checkout|checkout]])
- **Дані**: 89 товарів / 9 категорій з prom.ua (`materials/products.csv`, гілка main); фото `image/catalog/hydrophob/`
- **Deploy**: rsync `--relative --files-from` → chown hydrophobnet → `rm -f system/storage/cache/cache.*`; SQL через scp+mysql. Стара bare-repo pipeline (`git push production`) — НЕБЕЗПЕЧНА, НЕ використовувати (перезапише OC старим sectional-PHP)
- **Обмеження**: секрети — тільки в config.php на сервері та `.vscode/sftp.json` (гітігнорені); `materials/` 1.5GB НЕ в git

Актуальний стан і незакрите — `handoff.md` в корені repo (першоджерело).
