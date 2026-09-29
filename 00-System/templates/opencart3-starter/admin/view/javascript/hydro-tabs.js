/* Таби у формах модулів адмінки — одна реалізація на всю групу Hydrophob.
 *
 * Нічого не міняє в даних: просто ховає секції форми під вкладки, щоб довга
 * простирадло-форма читалась. Розмітка мінімальна — обгортаємо логічні куски:
 *
 *   <form ... data-hydro-tabs>
 *     <div class="hydro-tab" data-tab-title="Загальне" data-tab-icon="fa-sliders"> … </div>
 *     <div class="hydro-tab" data-tab-title="Контент"> … </div>
 *     <div class="hydro-tab" data-tab-title="Показ"> … </div>
 *   </form>
 *
 * Панель вкладок малюється сама, перед першою секцією.
 *
 * Дрібниці, які й були метою:
 *   • активна вкладка памʼятається між заходами (sessionStorage, по роуту);
 *   • вкладка з помилкою підсвічується і відкривається одразу після сабміту;
 *   • лічильник рядків повторювача показується прямо на вкладці.
 */
(function () {
    'use strict';

    function routeKey() {
        var match = location.search.match(/route=([^&]+)/);
        return 'hydro-tab:' + (match ? match[1] : location.pathname);
    }

    function build(form) {
        if (form.hydroTabsReady) return;

        var panes = Array.prototype.filter.call(form.querySelectorAll('.hydro-tab'), function (pane) {
            // вкладені форми не чіпаємо
            return pane.closest('[data-hydro-tabs]') === form;
        });

        if (panes.length < 2) return;

        // Таби мають сенс лише коли форма справді довга. Якщо всі поля й так
        // влазять в екран і повторювача нема — показуємо все одним списком,
        // інакше вкладки лише додають зайвий клік.
        var hasRepeater = !!form.querySelector('[data-repeater]');

        if (!hasRepeater) {
            var total = 0;

            panes.forEach(function (pane) {
                var was = pane.hidden;
                pane.hidden = false;
                total += pane.getBoundingClientRect().height;
                pane.hidden = was;
            });

            if (total < window.innerHeight * 1.1) {
                panes.forEach(function (pane) { pane.hidden = false; });
                return;
            }
        }

        form.hydroTabsReady = true;

        var nav = document.createElement('ul');
        nav.className = 'nav nav-tabs hydro-tabs';

        panes.forEach(function (pane, index) {
            var title = pane.dataset.tabTitle || ('#' + (index + 1));
            var icon = pane.dataset.tabIcon || '';

            var li = document.createElement('li');
            var a = document.createElement('a');

            a.href = '#';
            a.dataset.tabIndex = String(index);
            a.innerHTML = (icon ? '<i class="fa ' + icon + '"></i> ' : '') + title
                + ' <span class="hydro-tabs__count"></span>';

            li.appendChild(a);
            nav.appendChild(li);

            pane.hidden = index !== 0;
            li.className = index === 0 ? 'active' : '';
        });

        panes[0].parentNode.insertBefore(nav, panes[0]);

        function activate(index) {
            panes.forEach(function (pane, i) {
                pane.hidden = i !== index;
            });

            Array.prototype.forEach.call(nav.children, function (li, i) {
                li.className = i === index ? 'active' : '';
            });

            try { sessionStorage.setItem(routeKey(), String(index)); } catch (e) {}
        }

        nav.addEventListener('click', function (event) {
            var link = event.target.closest('a[data-tab-index]');
            if (!link) return;

            event.preventDefault();
            activate(Number(link.dataset.tabIndex));
        });

        // лічильник рядків повторювача на вкладці
        function counts() {
            panes.forEach(function (pane, index) {
                var list = pane.querySelector('[data-repeater]');
                var badge = nav.children[index].querySelector('.hydro-tabs__count');
                if (!list || !badge) return;

                var total = pane.querySelectorAll('[data-repeater-row]').length;
                badge.textContent = total ? '(' + total + ')' : '';
            });
        }

        counts();
        form.addEventListener('click', function () { setTimeout(counts, 0); });

        // вкладка з помилкою важливіша за запамʼятану
        var failed = -1;

        panes.forEach(function (pane, index) {
            if (failed === -1 && pane.querySelector('.text-danger, .has-error')) failed = index;
        });

        if (failed > -1) {
            activate(failed);
            nav.children[failed].classList.add('hydro-tabs__item--error');
            return;
        }

        var saved = -1;

        try { saved = Number(sessionStorage.getItem(routeKey())); } catch (e) {}

        if (saved > 0 && saved < panes.length) activate(saved);
    }

    function initAll() {
        document.querySelectorAll('[data-hydro-tabs]').forEach(build);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    window.hydroTabsInit = initAll;
})();
