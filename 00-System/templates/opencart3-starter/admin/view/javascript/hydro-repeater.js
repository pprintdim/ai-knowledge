/* Повторювачі в модулях адмінки — одна реалізація на всю групу Hydrophob.
 *
 * Розмітка (мінімум):
 *   <div class="hydro-rep">
 *     <div data-repeater data-prefix="items">
 *       <div class="hydro-rep__row" data-repeater-row>
 *         <div class="hydro-rep__head" data-repeater-toggle>
 *           <span class="hydro-rep__grip" data-repeater-grip></span>
 *           <i class="fa fa-chevron-down hydro-rep__chev"></i>
 *           <span class="hydro-rep__preview" data-repeater-preview></span>
 *           <button type="button" data-repeater-remove>…</button>
 *         </div>
 *         <div class="hydro-rep__body"> …поля з name="items[0][field]"… </div>
 *       </div>
 *     </div>
 *     <button type="button" data-repeater-add>Додати</button>
 *     <template data-repeater-template> …той самий рядок з items[__index__]… </template>
 *   </div>
 *
 * Що дає:
 *   • рядки згорнуті за замовчуванням, клік по шапці розгортає;
 *   • порядок міняється перетягуванням (стрілки не потрібні);
 *   • після будь-якої зміни індекси в name[] перенумеровуються за порядком у DOM,
 *     тому порядок у формі = порядок збереження;
 *   • у шапці видно номер і текст першого поля з [data-preview].
 *
 * Старі стрілки [data-repeater-up]/[data-repeater-down] ще працюють, якщо десь
 * лишились, але в розмітці їх більше не ставимо.
 */
(function () {
    'use strict';

    var DRAG_TYPE = 'text/hydro-repeater';

    function rows(list) {
        return Array.prototype.filter.call(list.children, function (node) {
            return node.nodeType === 1 && node.hasAttribute('data-repeater-row');
        });
    }

    function init(list) {
        if (list.hydroRepeaterReady) return;
        list.hydroRepeaterReady = true;

        var scope = list.closest('.hydro-rep') || list.parentNode;
        var template = scope.querySelector('[data-repeater-template]');
        var addButton = scope.querySelector('[data-repeater-add]');
        var prefix = list.dataset.prefix || '';

        // Перенумерація name="prefix[N][...]" за поточним порядком у DOM.
        // Без неї перетягнутий рядок зберігся б зі старим індексом.
        function renumber() {
            rows(list).forEach(function (row, index) {
                if (prefix) {
                    row.querySelectorAll('[name]').forEach(function (field) {
                        field.name = field.name.replace(
                            new RegExp('^' + prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\[[^\\]]*\\]'),
                            prefix + '[' + index + ']'
                        );
                    });
                }

                // id/for/href усередині рядка теж мають бути унікальні:
                // до них чіпляється файловий менеджер OpenCart
                row.querySelectorAll('[id*="__index__"], [for*="__index__"], [data-video-input*="__index__"]').forEach(function (node) {
                    ['id', 'for', 'data-video-input'].forEach(function (attr) {
                        var value = node.getAttribute(attr);
                        if (value) node.setAttribute(attr, value.split('__index__').join(index));
                    });
                });

                preview(row, index);
            });
        }

        function preview(row, index) {
            var box = row.querySelector('[data-repeater-preview]');
            if (!box) return;

            // Рядок без поля-джерела (напр. список обраних товарів) уже має
            // готовий підпис — його не чіпаємо, інакше затремо назву.
            if (!row.querySelector('[data-preview]')) return;

            // беремо перше видиме поле з [data-preview]; якщо мова перемкнута,
            // видимим лишається лише активний мовний блок
            var source = row.querySelector('[data-preview]');
            var visible = Array.prototype.find.call(row.querySelectorAll('[data-preview]'), function (node) {
                return node.offsetParent !== null && node.value;
            });

            source = visible || source;

            var text = '';

            if (source) {
                text = source.tagName === 'SELECT'
                    ? (source.options[source.selectedIndex] ? source.options[source.selectedIndex].text : '')
                    : source.value;
            }

            box.textContent = (index + 1) + '.' + (text ? ' ' + text : '');
        }

        // ── згортання ────────────────────────────────────────────────────────
        list.addEventListener('click', function (event) {
            var row = event.target.closest('[data-repeater-row]');
            if (!row || !list.contains(row)) return;

            if (event.target.closest('[data-repeater-remove]')) {
                row.remove();
                renumber();
                return;
            }

            // старі стрілки, поки трапляються
            if (event.target.closest('[data-repeater-up]') && row.previousElementSibling) {
                row.parentNode.insertBefore(row, row.previousElementSibling);
                renumber();
                return;
            }

            if (event.target.closest('[data-repeater-down]') && row.nextElementSibling) {
                row.parentNode.insertBefore(row.nextElementSibling, row);
                renumber();
                return;
            }

            if (!event.target.closest('[data-repeater-toggle]')) return;
            // клік по кнопці/посиланню/полю в шапці не має згортати рядок
            if (event.target.closest('button, a, input, select, textarea, label')) return;

            row.classList.toggle('is-open');
        });

        // ── прев'ю в шапці ───────────────────────────────────────────────────
        list.addEventListener('input', function (event) {
            if (!event.target.hasAttribute('data-preview')) return;

            var row = event.target.closest('[data-repeater-row]');
            if (row) preview(row, rows(list).indexOf(row));
        });

        list.addEventListener('change', function (event) {
            if (!event.target.hasAttribute('data-preview')) return;

            var row = event.target.closest('[data-repeater-row]');
            if (row) preview(row, rows(list).indexOf(row));
        });

        // ── перетягування ────────────────────────────────────────────────────
        // Тягнемо за ручку: інакше не виділити текст у полях усередині рядка.
        var dragged = null;

        // У плитковій сітці ручки нема — тягнеться сама плитка; у списку
        // рядків тягнемо лише за ручку, інакше не виділити текст у полях.
        var tiles = list.classList.contains('hydro-tiles');

        list.addEventListener('mousedown', function (event) {
            var grip = event.target.closest('[data-repeater-grip]');
            var row = event.target.closest('[data-repeater-row]');

            if (!row || !list.contains(row)) return;

            if (tiles) {
                row.draggable = !event.target.closest('button, a, input, select, textarea');
                return;
            }

            row.draggable = !!grip;
        });

        list.addEventListener('dragstart', function (event) {
            var row = event.target.closest('[data-repeater-row]');
            if (!row || !row.draggable) return;

            dragged = row;
            row.classList.add('is-dragging');

            event.dataTransfer.effectAllowed = 'move';
            // Firefox не починає перетягування без даних
            try { event.dataTransfer.setData(DRAG_TYPE, '1'); } catch (e) {}
        });

        list.addEventListener('dragover', function (event) {
            if (!dragged) return;

            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';

            var over = event.target.closest('[data-repeater-row]');
            if (!over || over === dragged || !list.contains(over)) return;

            var box = over.getBoundingClientRect();
            var after = (event.clientY - box.top) > box.height / 2;

            list.insertBefore(dragged, after ? over.nextSibling : over);
        });

        list.addEventListener('drop', function (event) {
            if (dragged) event.preventDefault();
        });

        list.addEventListener('dragend', function () {
            if (!dragged) return;

            dragged.classList.remove('is-dragging');
            dragged.draggable = false;
            dragged = null;

            renumber();
        });

        // ── додавання ────────────────────────────────────────────────────────
        if (addButton && template) {
            addButton.addEventListener('click', function () {
                var index = rows(list).length;
                var html = template.innerHTML.split('__index__').join(index);

                list.insertAdjacentHTML('beforeend', html);

                var row = list.lastElementChild;

                // новий рядок відкритий — його щойно додали, туди одразу пишуть
                row.classList.add('is-open');

                // мовні блоки: показуємо ту саму мову, що відкрита в табах
                if (window.hpActiveLanguage) {
                    var language_id = window.hpActiveLanguage();

                    if (language_id) {
                        row.querySelectorAll('.js-lang').forEach(function (block) {
                            block.hidden = !block.classList.contains('js-lang-' + language_id);
                        });
                    }
                }

                renumber();

                var first = row.querySelector('input:not([type=hidden]), textarea, select');
                if (first) first.focus();

                row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        }

        // плитка з відео показує трикутник; без відео — просто картинка
        function syncMedia() {
            rows(list).forEach(function (row) {
                var video = row.querySelector('[data-media-video]');
                var play = row.querySelector('[data-media-play]');
                if (!play) return;

                play.hidden = !(video && video.value);
            });
        }

        syncMedia();
        list.addEventListener('change', syncMedia);
        document.addEventListener('hydro:media-change', syncMedia);

        renumber();
    }

    function initAll() {
        document.querySelectorAll('[data-repeater]').forEach(init);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    // модулі, які домальовують повторювач самі, можуть переініціалізувати
    window.hydroRepeaterInit = initAll;
})();
