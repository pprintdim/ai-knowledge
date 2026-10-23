# brosse — специфікації секцій для порту в OpenCart 3

Контракти для `layout-porter` / `oc-module-builder`: кожен `*.spec.json` описує одну секцію верстки
(`html/.output/public/*.html` — істина; React-джерело в `html/src/` — лише для поведінки й даних).
Файли `page_*.spec.json` пише паралельно інший агент — не чіпати.

## Головна (`/`) — порядок модулів у layout Home, position `content_top`

| sort | code | файл | що це |
|---|---|---|---|
| 1 | `home_hero` | [home_hero.spec.json](home_hero.spec.json) | відеослайдер (3 кліпи, крапки, звук) + 2 мінікартки + CTA → продукт |
| 2 | `home_intro` | [home_intro.spec.json](home_intro.spec.json) | 3D-коробка (scroll/drag) + лого з 5 «літаючими» щітками |
| 3 | `home_text` | [home_text.spec.json](home_text.spec.json) | центрований маніфест з піґулкою «brosse», CTA → «Про нас» |
| 4 | `home_brushes` | [home_brushes.spec.json](home_brushes.spec.json) | слайдер щіток — **товари категорії магазину**, не статика |
| 5 | `home_stats` | [home_stats.spec.json](home_stats.spec.json) | 3 count-up цифри |
| 6 | `home_video` | [home_video.spec.json](home_video.spec.json) | відеобанер з пультом play/pause/звук/прогрес |
| 7 | `home_faq` | [home_faq.spec.json](home_faq.spec.json) | акордеон «Поширені питання» |

Header/footer — не модулі, це `common/header.twig` / `common/footer.twig` (описує page-спека).

## Спільні конвенції

### Контейнер і сітка
- `.container-site` = `width:100%; max-width:1440px; margin-inline:auto; padding-inline:1rem` → `3rem` від `md` (768px).
  Секції або самі `container-site` (hero, intro, text, stats, faq), або повноширинні з `bg-surface` і `container-site` всередині (brushes, video).
- Брейкпоїнти Tailwind: `sm` 640, `md` 768 (основний), `lg` 1024.
- Обгортка сторінки: `<div class="min-h-screen overflow-x-hidden">` — ховає виступ 3D-коробки на вузьких екранах.

### Шрифти і токени
- Шрифт один — **Seenonim** (`@font-face` з `__l5e/assets-v1/3749c79f-662a-442a-8ba4-9708eeaa996d/seenonim-v1.otf`, також `materials/Fonts`), fallback Unbounded (Google Fonts 400/600, підключений у `<head>`), потім `system-ui`. `font-sans` = `font-display` = той самий стек.
- Кольори — CSS-змінні в oklch (`html/src/styles.css`): `--background .985`, `--foreground oklch(.3 .015 250)`, `--accent oklch(.7 .19 45)` (помаранчевий), `--accent-foreground .99`, `--surface oklch(.94 .008 240)` (сірий фон секцій), `--ink oklch(.27 .015 250)` (темний), `--ink-foreground .98`, `--muted-foreground .55`, `--border .86`, `--watermark .92`, `--secondary .95`.
- Утиліти з верстки, яких нема в Tailwind: `shadow-soft` (`0 20px 40px -20px oklch(.3 .015 250/.35)`), `bg-gradient-pastel` (`linear-gradient(135deg, oklch(.95 .03 340), oklch(.96 .03 80))`), `bg-gradient-ink`, `container-site`.
- `--radius: 1rem` → `rounded-2xl` = 1.5rem, картки `rounded-[2rem]`/`rounded-[2.5rem]`.
- CSS теми: найпростіше взяти зібраний `html/.output/public/assets/styles-DCYc-3BJ.css` (90 КБ, вже містить усі використані класи) і дописувати свої; якщо збирати Tailwind заново — safelist для класів, що приходять з адмінки (позиції щіток у `home_intro`).

### Reveal / motion (глобальний `theme.js`, не в модулях)
- `[data-reveal]` → `opacity:0; translateY(40px)`, при `.is-in` — видимий; `data-reveal="scale"` — `scale(.92)`, `data-reveal="left"` — `translateX(-60px)`; затримка `--d` (inline style). IntersectionObserver `threshold: 0.15`, одноразово.
- **Авто-reveal**: `useRevealAll()` проставляє `data-reveal` всім `main :is(h1,h2,h3,p,img,video,form,li,button.group,a.group)`, у яких нема предка `[data-reveal]`, `.slide-in`, `[data-noreveal]` і нема нащадка `[data-reveal]`; `img/video` отримують `scale`, `--d = (i % 4) * 0.08s`. Відтворити цей тегер у `theme.js` — інакше половина сторінки не анімується.
- `[data-noreveal]` на секції = всередині нічого автоматично не тегати (hero, brushes — вони анімуються `.slide-in`).
- `.slide-in > *` — keyframe `slide-in .9s` (translateX(-50px) + blur), друга дитина +.15s; перезапуск — заміною вузла або reflow.
- `[data-parallax="0.08"]` — `style.translate = 0 {offset*-k}px` на scroll; `.float` — 6s вертикальне погойдування з `rotate(var(--r))`.
- `prefers-reduced-motion: reduce` → reveal одразу видимий, `.float`/`.box-spin` вимкнені, parallax не стартує.
- Хуки модулів: `[data-hero-slider]`, `[data-box3d]`, `[data-brush-slider]`, `[data-countup]`, `[data-video-banner]`, `[data-faq]` — назви атрибутів мої (у верстці React без них); порт має їх ввести однаково у twig і JS.
- Також глобально: scroll-progress `<div class="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-accent" style="transform:scaleX(p)">`, header ховається при скролі вниз (`.site-header.is-hidden`, після 120px).

### Партіал ArrowLink (CTA з колом-стрілкою) — у hero, text, brushes
```html
<a class="group inline-flex items-center gap-4" href="{{ href }}">
  <span class="whitespace-nowrap text-xs uppercase tracking-wide transition-transform duration-500 group-hover:-translate-x-1">{{ text }}</span>
  <span class="magnet-fill grid h-11 w-11 place-items-center rounded-full border transition-all duration-500 group-hover:translate-x-2 group-hover:scale-110 group-active:scale-95 group-hover:bg-accent group-hover:border-accent group-hover:text-accent-foreground border-foreground">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right h-5 w-5 transition-transform duration-500 group-hover:-rotate-45" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
  </span>
</a>
```
Варіант `light` (на темному) — `border-ink-foreground` замість `border-foreground`; варіант `back` — arrow-left з `group-hover:rotate-45`. `.magnet-fill::before` — акцентна заливка кола `scale(0→1)` при hover (CSS у styles.css).
Sparkle: `<span class="text-accent">✦</span>`.

### Лого (inline SVG, `currentColor`)
`<svg viewBox="0 0 331 61" class="h-[1em] w-auto" aria-label="brosse" role="img"><g transform="translate(0,61) scale(0.1,-0.1)"><path d="…" fill="currentColor"/></g></svg>` — path у `html/src/components/logo-paths.ts` (один `d`), той самий малюнок у OpenCart `image/catalog/logo.svg`. Розмір задається `font-size` батька (`text-2xl` у шапці, `text-5xl` в intro, `text-[13rem]` у відео, `text-[11rem]` у футері). Зробити twig-партіал `common/logo.twig` і інклюдити, а не дублювати path.

### Іконки (lucide, inline SVG 24×24, `stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"`, `aria-hidden="true"`)
- arrow-right: `M5 12h14` + `m12 5 7 7-7 7`
- arrow-left: `m12 19-7-7 7-7` + `M19 12H5`
- volume-x: `M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z` + `<line x1="22" x2="16" y1="9" y2="15"/>` + `<line x1="16" x2="22" y1="9" y2="15"/>`
- volume-2: той самий перший path + `M16 9a5 5 0 0 1 0 6` + `M19.364 18.364a9 9 0 0 0 0-12.728`
- play: `M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z`
- pause: `<rect x="14" y="3" width="5" height="18" rx="1"/>` + `<rect x="5" y="3" width="5" height="18" rx="1"/>`
- plus: `M5 12h14` + `M12 5v14`; minus: `M5 12h14`
Рекомендація: twig-партіал `common/icon.twig` з `{% include ... with {name:'play', class:'h-3 w-3'} %}`.

### Асети
- Lovable-асети лежать у `html/.output/public/__l5e/assets-v1/<uuid>/<file>` (список з розмірами — у кожній спеці). У OpenCart перекласти в `image/catalog/home/` (картинки) і `image/catalog/video/` (mp4, постери) з людськими іменами; відео й великі PNG у git не комітити (deploy.sh синкає `image/` лише лого/фавікон — заливати окремо).
- PNG щіток (≈300×890, альфа) — не прогоняти через `tool/image` у jpg; віддавати оригінал/webp з альфою.
- Hero-відео 1080×1920 по 4.6–8.3 МБ — перетиснути (CRF, 720×1280 достатньо для картки ≤460px) перед заливкою; `preload=auto` лише для першого.

### OpenCart
- Модулі — `extension/module/home_*` за патерном hydrophob (controller + twig + мовні файли `uk-ua`/`en-gb` + admin controller/twig/lang з формою). Інстансні: `home_hero`, `home_faq` (перевикористовні); решта одиничні.
- Тема `catalog/view/theme/brosse/` (`config_theme=default`, `theme_default_directory=brosse`). Мови: `uk-ua` типова, `en-gb`.
- Мультимовні поля в адмінці — вкладки по `languages`; зберігати як `name[lang_id]` → JSON у `oc_module.setting`. Пам'ятати про граблі: `editModule` пише лише POST — кожному ключу має відповідати поле у формі (00-System/… CLAUDE «збереження стирає ключі»).
- Посилання: `/product` → картка товару або категорія (open question), `/about` → `information/information&information_id=<About>`, ніколи не хардкодити шляхи.
- Копірайт/Lorem: `home_text`, `home_stats` (підписи), `home_faq` — у верстці плейсхолдери; у дефолтах модулів лишити як є, замовник дасть тексти.

## Відкриті питання (home)
1. **`/product` у верстці — одна сторінка одного набору** (5 щіток як один товар? у `cart.ts` 5 окремих товарів BR-01…BR-05). Куди вести CTA «Детальніше» (hero) і «До покупок» (brushes): на картку набору, на картку активної щітки чи на категорію? Поки в спеках: hero → налаштовуване посилання, brushes → картка активного товару.
2. **Коротка назва товару для H2** у `home_brushes` (PREMIUM vs «Brosse Premium»): окреме поле/атрибут чи зрізати префікс «Brosse »? І звідки брати короткий опис (meta_description / обрізаний description / атрибут).
3. **Відео банера `brosse.mp4`** — 320×568 (вертикальне, 2.7 МБ): у десктопному банері 600px заввишки буде розмите й обрізане по боках. Потрібен горизонтальний майстер (у макеті — горизонтальний ролик з черевиком) або прийняти як є (`video-prep`-агент, якщо є вихідник).
4. **Дрібний текст на мобільному**: у верстці `text-[10px]`/`text-[9px]`/`text-[8px]` (картки hero, підписи stats, пульт brushes, лічильник) — нижче правила ≥12px. Порт 1:1 чи одразу піднімати до 12px на `<md`? Рекомендую піднімати (правило глобальне), але це відхилення від верстки — потрібне «ок».
5. **Авто-reveal**: відтворювати React-тегер у `theme.js` (чесне 1:1) чи проставити `data-reveal` явно в twig (прозоріше, але треба пройтись по всіх елементах)? Рекомендую тегер — менше ручної роботи при наступних секціях.
6. Мобільний макет відрізняється від HTML (горизонтальний скрол карток у hero, кругла кнопка play по центру банера) — спеки йдуть за HTML; якщо замовник хоче як у макеті, це окремі правки після порту.
7. **Hero slide 1 бейдж** (`sneaker.png` у піґулці заголовка) — робити HTML-полем з `{badge}` або окремим image-полем на слайд (у спеці — друге).
