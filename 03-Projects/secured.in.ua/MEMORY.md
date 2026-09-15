# secured.in.ua - project memory

## User direction (2026-09-15)
The user explicitly changed the deployment target to a NEW SUBDOMAIN and confirmed the new `openCart` branch. Preserve the existing `secured.in.ua` legacy OpenCart 1.5.4.1 store (site user securedin). Do not deploy the new CMS to the main domain without a new launch instruction.

## Branches and local checkout
- Repository: pprintdim/secured.in.ua.
- Root: /Applications/MAMP/htdocs/secured.in.ua, now on orphan branch `openCart`, pushed commit `9c1bef2`.
- `html/`: ignored worktree `main`, sectional PHP layout (19 pages), commit `66f5ad5`, served at https://html.secured.in.ua.
- `lovable`: original React/TanStack/Tailwind v4 design source; preserved.
- Layout data: html/data/*.json; photos: html/img/; CSS: html/css/style.css. Layout CSS builder uses Tailwind CLI from the prior Claude scratchpad.

## New OpenCart site
- https://new.secured.in.ua, CloudPanel site user `newsecuredin`, PHP 8.3, root `/home/newsecuredin/htdocs/new.secured.in.ua`.
- DNS: Hetzner zone 1472601, A new -> 46.224.100.254; Let's Encrypt installed.
- Separate database/user: `securednew`; credentials only in ~/AI-Workspace/secrets/ACCESS.md. Admin: /admin/.
- OpenCart 3.0.3.9 prepared baseline from shoker.in.ua@b9f4cc5, before theme integration. New database installed from official tag cli_install.php/opencart.sql, no other store data. Installer removed before deployment.
- Baseline includes pruned stock extensions, Ukrainian/Russian/English language files, admin cache dropdown and noindex control. Defaults: uk-ua, UAH, Ukraine, Europe/Kyiv, owner@secured.in.ua. New Secured SVG logo. The fresh install demo catalog was removed. Full theme integration remains to be done.
- config_maintenance=1: branded common/maintenance.twig; guest response 503, Retry-After 3600, X-Robots-Tag noindex, no-store. Logged-in administrators see the underlying store. config_noindex=1 and robots.txt Disallow / remain enabled.
- nginx: @opencart routes to _route_; /system/, /tools/, /db.php denied. Backup: /root/new.secured.in.ua.before-routing.conf. CloudPanel updates may overwrite manual vhost rules.

## Deployment
- CMS: `python3 tools/deploy.py` in the root checkout. Requires clean `openCart` and HEAD pushed to origin/openCart. Deploys git archive HEAD as newsecuredin and writes REVISION. Target is locked to new.secured.in.ua. Ignored .vscode/sftp.json stores SFTP credentials; db.php exists only on server.
- Layout: ~/AI-Workspace/scripts/secured-html-deploy.sh sync [--full], site user htmlsecuredin, root /home/htmlsecuredin/htdocs/html.secured.in.ua, PHP 8.3.
- Credentials are in ACCESS.md, never in Git.

## Validation (2026-09-15)
Guest HTTPS 503 with branded maintenance; admin login 200 -> dashboard; authenticated storefront 200 with noindex and no PHP errors in response. Main and html sites both 200. Deployed initial commit 9c1bef211760285592df0368dcbde22f06002200.
