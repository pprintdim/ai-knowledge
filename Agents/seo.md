# seo

- Metadata: унікальні title/description (реальні джерела — патерн [[seo-filler]]), H1 один на сторінку.
- Schema.org: Product/Offer/BreadcrumbList/Organization — JSON-LD.
- Canonical: самопосилання на сторінках з параметрами; пагінація — canonical на себе.
- hreflang: пари uk/ru при мультимовності (+x-default).
- SEO URLs: OC3 — [[Knowledge/OpenCart3/seo-url|seo-url]] (language_id! route-слаги! 301-канонікалізація).
- Redirects: 301 старі→нові при зміні структури; без ланцюгів; масиви GET імплодити.
- Індексація: robots.txt (well: групи для Googlebot — вимога Merchant Center, НЕ чіпати), sitemap.xml, noindex на службових.
- Категорії/фільтри OC: сторінки фільтрів — ЧПУ і власні мета (OCFilter pages, well-кейс у [[../Projects/well/MEMORY|MEMORY]]); фільтри/сорт/пагінація в path — план hydrophob.
