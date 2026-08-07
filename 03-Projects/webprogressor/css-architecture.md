> [!note] Імпортовано з `/Users/pprintdim/Desktop/vs_projects/webprogressor/.claude/css-architecture.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 0. Оригінал: untracked, видалений.

---
name: CSS Architecture — webprogressor
description: Structure of CSS files, media queries, and adaptive layout rules for the webprogressor theme
type: project
---

## CSS File Structure

| File | Purpose |
|---|---|
| `style.css` | Global styles: typography, elements, components, nav, footer, hero, calendar, subscribe, content-sec, call-sec |
| `assets/css/home.css` | Homepage-specific sections: Cases carousel, Focus, Works, Ready sec, Content sec variants |
| `assets/css/pages.css` | Page template sections: Process, Services, Cards, Timeline, Cases grid, Starter, Tell, FAQ, Create, Text Hero, Progress, Why, What, How, Form Hero, Websites, Work, Packages, Audit, Stages, Ready sec |
| `assets/css/posts.css` | Single post/case sections: Stats, Cases grid, Case Hero, Content, Accelerate, Story |
| `assets/css/media.css` | All responsive/adaptive rules — centralized, organized by section |

**Why:** Media queries were scattered inline across CSS files with duplicates. `media.css` is the single source of truth for all breakpoints.

**How to apply:** Always add new responsive rules to `media.css`, never inline inside `home.css`, `pages.css`, or `posts.css`.

---

## media.css Structure

Each section has its own comment block followed by its @media rules:

```css
/* Section Name
   ========================================================================== */
@media (max-width: 1080px) { ... }
@media (max-width: 768px) { ... }
@media (max-width: 580px) { ... }
```

**Breakpoint range used:** 1080px → 920px → 768px → 580px → 520px

---

## Breakpoint Guide

| Breakpoint | Usage |
|---|---|
| `1080px` | Tablet landscape — collapse 4-col → 2-col grids, reduce large padding/font |
| `920px` | Used only for Case Hero (1fr max-content → 100%) |
| `768px` | Tablet portrait — collapse all 2-col grids → 1-col, main mobile layout |
| `580px` | Mobile — reduce font sizes (56px→28px, 62px→44px, 26px→18-20px), reduce padding |
| `520px` | Small mobile — Cases carousel card min-width = calc(100vw - 36px) |

---

## Enqueue Order in functions.php

```php
wp_enqueue_style('webprogressor-style', get_stylesheet_uri(), [], _S_VERSION);
wp_enqueue_style('webprogressor-media', .../assets/css/media.css, [], _S_VERSION); // global
wp_enqueue_style('swiper', .../assets/css/swiper-bundle.min.css);
wp_enqueue_style('home-style', .../assets/css/home.css);      // front_page only
wp_enqueue_style('theme-pages', .../assets/css/pages.css);    // tpl/ + singular case/service
wp_enqueue_style('theme-posts', .../assets/css/posts.css);    // front_page + portfolio + home + archive + tax
```

---

## Sections Covered in media.css

| Section | File | Breakpoints |
|---|---|---|
| Sub-Menu | style.css | 768px |
| Cases (carousel) | home.css | 1080px, 768px, 520px |
| Focus | home.css | 768px, 580px |
| Works | home.css / pages.css | 1080px, 768px |
| Ready sec | home.css / pages.css | 768px, 580px |
| Content sec (home) | home.css | 768px |
| Content sec (pages: content5/6) | pages.css | 768px |
| Process Section | pages.css | 1080px, 768px, 580px |
| Services Section | pages.css | 1080px, 768px, 580px |
| Cards Section | pages.css | 768px |
| Timeline sec | pages.css | 1080px, 768px, 580px |
| Cases sec (grid) | pages.css / posts.css | 768px, 520px |
| Starter Section | pages.css | 1080px, 768px, 580px |
| Tell Section | pages.css | 1080px, 768px, 580px |
| FAQ | pages.css | 768px, 580px |
| Create Section | pages.css | 768px, 580px |
| Text Hero | pages.css | 1080px, 768px, 580px |
| Progress Section | pages.css | 1080px, 768px, 580px |
| Why Sec | pages.css | 768px, 580px |
| What Section | pages.css | 768px, 580px |
| How Sec | pages.css | 1080px, 768px, 580px |
| Form Hero | pages.css | 1080px, 768px, 580px |
| Websites Sec | pages.css | 1080px, 768px, 580px |
| Work Sec | pages.css | 1080px, 768px, 580px |
| Packages Section | pages.css | 1080px, 768px, 580px |
| Packages Hero | pages.css | 1080px, 768px, 580px |
| Audit Sec | pages.css | 768px, 580px |
| Stages Sec | pages.css | 1080px, 768px |
| Results sec (stats) | posts.css | 768px, 580px |
| Case Hero | posts.css | 1080px, 920px, 768px, 580px |
| Accelerate Section | posts.css | 1080px, 768px, 580px |
| Story Section | posts.css | 1080px, 768px, 580px |
