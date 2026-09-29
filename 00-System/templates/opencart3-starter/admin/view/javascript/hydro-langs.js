/* Один перемикач мов на всю форму модуля — для всієї групи Hydrophob.
 *
 * Навіщо: мовні вкладки жили по-різному й по кілька штук на сторінці — окремо
 * над описом, окремо всередині кожного рядка повторювача. Тепер перемикач один,
 * стоїть зверху форми і керує ВСІМА мовними блоками одразу, зокрема тими, що
 * лежать усередині рядків повторювача.
 *
 * Нічого не вимагає від шаблону: бібліотека сама знаходить мовні блоки в будь-
 * якому з наявних написань і зводить їх до спільного вигляду —
 *   .js-lang.js-lang-<id>      (hydrophob.net.ua)
 *   .faq-lang.faq-lang-<id>    (hydrophob.com.ua)
 *   .tab-pane#language<id>     (стокові вкладки OpenCart)
 *   [data-lang-block="<id>"]   (явне позначення, якщо треба)
 *
 * Локальні перемикачі ховаються, замість них малюється один спільний.
 * Поля всіх мов лишаються в DOM — ховається лише те, що не активне, тому
 * сабміт, як і раніше, надсилає всі мови.
 */
(function () {
    'use strict';

    var STORE = 'hydro-lang';

    function langOf(node) {
        var m;

        if (node.dataset && node.dataset.langBlock) return node.dataset.langBlock;

        m = (node.className || '').toString().match(/(?:js-lang|faq-lang|lang-field|delivery-lang|hydro-lang)-(\d+)/);
        if (m) return m[1];

        m = (node.id || '').match(/^language(\d+)$/);
        if (m) return m[1];

        return null;
    }

    // Стокові bootstrap-вкладки мов: <a data-toggle="tab" href="#щось<langId>">.
    // Позначаємо їхні панелі як мовні блоки, щоб далі все йшло спільним шляхом.
    function adoptBootstrapTabs(form) {
        form.querySelectorAll('ul.nav-tabs').forEach(function (ul) {
            var links = Array.prototype.slice.call(ul.querySelectorAll('a[data-toggle="tab"][href^="#"]'));

            if (links.length < 2 || links.length !== ul.children.length) return;

            var pairs = [];

            for (var i = 0; i < links.length; i++) {
                var href = links[i].getAttribute('href');
                var m = href.match(/(\d+)$/);
                var target = m && document.getElementById(href.slice(1));

                if (!m || !target) return;

                pairs.push({ id: m[1], target: target, link: links[i] });
            }

            // усі id різні — це саме перемикач мов, а не змістовні вкладки
            var seen = {};

            for (var j = 0; j < pairs.length; j++) {
                if (seen[pairs[j].id]) return;
                seen[pairs[j].id] = true;
            }

            pairs.forEach(function (pair) {
                pair.target.setAttribute('data-lang-block', pair.id);
                pair.link.setAttribute('data-lang', pair.id);
            });
        });
    }

    // усі мовні блоки форми, зведені до одного класу
    function blocks(form) {
        var found = form.querySelectorAll(
            '[class*="js-lang-"], [class*="faq-lang-"], [class*="lang-field-"], ' +
            '[class*="delivery-lang-"], [class*="hydro-lang-"], ' +
            '[data-lang-block], .tab-pane[id^="language"]'
        );
        var list = [];

        Array.prototype.forEach.call(found, function (node) {
            var id = langOf(node);
            if (!id) return;

            if (!node.classList.contains('hydro-lang')) {
                node.classList.add('hydro-lang', 'hydro-lang-' + id);
            }

            // стокові bootstrap-вкладки більше не керують показом
            node.classList.remove('tab-pane', 'fade', 'active', 'in');

            list.push({ node: node, id: id });
        });

        return list;
    }

    // мови беремо з локальних перемикачів: там є і назва, і прапорець
    function languages(form, ids) {
        var found = {};

        form.querySelectorAll('a[data-lang], a[data-faq-lang], a[href^="#language"]').forEach(function (a) {
            var id = a.dataset.lang || a.dataset.faqLang || (a.getAttribute('href') || '').replace('#language', '');
            if (!id || found[id]) return;

            var img = a.querySelector('img');

            found[id] = {
                id: id,
                name: (a.textContent || '').trim() || ('#' + id),
                flag: img ? img.getAttribute('src') : '',
            };
        });

        // мова є в розмітці, але перемикача під неї не знайшлось
        ids.forEach(function (id) {
            if (!found[id]) found[id] = { id: id, name: '#' + id, flag: '' };
        });

        // українська — дефолтна мова магазинів, тому завжди перша
        return Object.keys(found)
            .sort(function (a, b) { return Number(a) - Number(b); })
            .map(function (id) { return found[id]; })
            .sort(function (x, y) {
                var ux = /укра|ukrain/i.test(x.name) ? 0 : 1;
                var uy = /укра|ukrain/i.test(y.name) ? 0 : 1;
                return ux - uy;
            });
    }

    function build(form) {
        if (form.hydroLangsReady) return;

        adoptBootstrapTabs(form);

        var list = blocks(form);

        var ids = [];

        list.forEach(function (item) {
            if (ids.indexOf(item.id) === -1) ids.push(item.id);
        });

        // Мовні блоки можуть лежати ТІЛЬКИ всередині рядків повторювача, а рядків
        // на новій формі ще нема. Тоді мови беремо з локального перемикача —
        // інакше він лишився б на сторінці сам по собі й нічим не керував.
        var langs = languages(form, ids);

        if (langs.length < 2) {
            list.forEach(function (item) { show(item.node, true); });
            return;
        }

        form.hydroLangsReady = true;

        langs.forEach(function (lang) {
            if (ids.indexOf(lang.id) === -1) ids.push(lang.id);
        });

        // ховаємо всі локальні перемикачі — далі керує спільний
        form.querySelectorAll('#language, .faq-global-langs, .delivery-global-langs, .hydro-global-langs, ul.nav-tabs').forEach(function (ul) {
            if (ul.classList.contains('hydro-tabs') && !ul.querySelector('a[data-lang], a[data-faq-lang], a[href^="#language"]')) return;
            if (!ul.querySelector('a[data-lang], a[data-faq-lang], a[href^="#language"]')) return;
            ul.remove();
        });

        var nav = document.createElement('ul');
        nav.className = 'nav nav-tabs hydro-langs';
        nav.setAttribute('data-hydro-langs', '');

        langs.forEach(function (lang, index) {
            var li = document.createElement('li');
            var a = document.createElement('a');

            a.href = '#';
            a.dataset.hydroLang = lang.id;
            a.innerHTML = (lang.flag ? '<img src="' + lang.flag + '" alt=""> ' : '') + lang.name;

            li.appendChild(a);
            nav.appendChild(li);

            if (index === 0) li.className = 'active';
        });

        // ставимо НАД усім контентом форми, поза будь-яким повторювачем
        var anchor = form.querySelector('.hydro-tab') || form.firstElementChild;
        form.insertBefore(nav, anchor);

        function activate(id) {
            Array.prototype.forEach.call(nav.children, function (li) {
                li.className = li.firstChild.dataset.hydroLang === id ? 'active' : '';
            });

            // перечитуємо блоки: рядки повторювача могли додатись після побудови
            blocks(form).forEach(function (item) { show(item.node, item.id === id); });

            form.dataset.hydroLang = id;

            try { sessionStorage.setItem(STORE, id); } catch (e) {}
        }

        nav.addEventListener('click', function (event) {
            var link = event.target.closest('a[data-hydro-lang]');
            if (!link) return;

            event.preventDefault();
            activate(link.dataset.hydroLang);
        });

        var saved = null;

        try { saved = sessionStorage.getItem(STORE); } catch (e) {}

        activate(saved && ids.indexOf(saved) > -1 ? saved : langs[0].id);

        // новий рядок повторювача має одразу показати активну мову
        form.addEventListener('click', function (event) {
            if (!event.target.closest('[data-repeater-add]')) return;
            setTimeout(function () { activate(form.dataset.hydroLang || langs[0].id); }, 0);
        });
    }

    function show(node, visible) {
        node.hidden = !visible;
        // faq-lang ховався інлайновим display — знімаємо, інакше hidden не подіє
        if (node.style.display === 'none' && visible) node.style.display = '';
        if (!visible) node.style.display = 'none';
    }

    function initAll() {
        document.querySelectorAll('#content form').forEach(build);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    // повторювач питає, яку мову показувати новому рядку
    window.hpActiveLanguage = function () {
        var form = document.querySelector('#content form[data-hydro-lang]');
        return form ? form.dataset.hydroLang : null;
    };

    window.hydroLangsInit = initAll;
})();
