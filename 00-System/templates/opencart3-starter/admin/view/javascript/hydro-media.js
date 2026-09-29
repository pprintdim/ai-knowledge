/* Медіа-плитки галерей в адмінці — спільні для групи Hydrophob.
 *
 * Плитка працює як медіа-поле в ACF: клік відкриває медіатеку OpenCart, звідти
 * можна взяти і картинку, і відео. Тип визначається за розширенням:
 *   • картинка → пишеться в [data-media-image], плитка показує саму картинку;
 *   • відео    → пишеться в [data-media-video], плитка показує кадр-заглушку
 *                (або постер, якщо картинку теж задано) і трикутник відтворення.
 *
 * Стоковий пікер OpenCart пише шлях у ПЕРШИЙ input поруч із посиланням і вимагає
 * у нього id — тому id роздаються тут, а не в шаблоні, і після закриття
 * медіатеки значення розкладається по потрібних полях.
 */
(function () {
    'use strict';

    var VIDEO = /\.(mp4|webm|ogv|mov|m4v)$/i;
    var seq = 0;

    function placeholder(tile) {
        var img = tile.querySelector('img');
        return (img && img.getAttribute('data-placeholder')) || '';
    }

    function videoPlaceholder() {
        return 'image/video-placeholder.svg';
    }

    // Шлях до файлу — за тим самим правилом, що й на фронті: імʼя без теки
    // означає файл теки теми, шлях із текою — файл із медіатеки (image/).
    var THEME_MEDIA = '../catalog/view/theme/hydrophob/image/';

    /**
     * Куди дивитись за файлом. Однозначно сказати не можна: 'promo/foo.webp'
     * буває і текою теми, і текою медіатеки — на фронті це вирішує перевірка
     * файлу, якої тут нема. Тому віддаємо обидва шляхи: беремо перший, а якщо
     * браузер його не знайшов, підставляємо другий.
     */
    function mediaUrls(value) {
        if (value.indexOf('catalog/view/') === 0) return ['../' + value];

        var theme = THEME_MEDIA + (VIDEO.test(value) ? 'video/' : '') + value;

        if (value.indexOf('/') !== -1) return ['../image/' + value, theme];

        return [theme];
    }

    function mediaUrl(value) {
        return mediaUrls(value)[0];
    }

    // картинка не знайшлась за першим шляхом — пробуємо другий, потім заглушку
    function setImage(picture, value, fallback) {
        var list = mediaUrls(value);

        picture.onerror = function () {
            picture.onerror = null;

            if (list.length > 1) {
                picture.onerror = function () {
                    picture.onerror = null;
                    picture.src = fallback;
                };

                picture.src = list[1];

                return;
            }

            picture.src = fallback;
        };

        picture.src = list[0];
    }

    /**
     * Прев'ю ролика — кадр із нього самого, а не однакова заглушка.
     * Замість <img> у рамку кладемо <video>: браузер намалює перший кадр,
     * і одразу видно, що саме за відео. Якщо кадр не зчитався (формат,
     * якого браузер не грає) — лишається заглушка.
     */
    function showVideoFrame(tile, value) {
        var frame = tile.querySelector('.hydro-tile__frame');
        var picture = tile.querySelector('img');

        if (!frame) return;

        var clip = frame.querySelector('video[data-media-frame]');

        if (!clip) {
            clip = document.createElement('video');
            clip.setAttribute('data-media-frame', '');
            clip.muted = true;
            clip.playsInline = true;
            clip.preload = 'metadata';
            frame.insertBefore(clip, frame.firstChild);
        }

        var list = mediaUrls(value);
        var src = list[0] + '#t=0.5';

        if (clip.getAttribute('src') !== src) {
            clip.setAttribute('src', src);
        }

        clip.hidden = false;

        if (picture) picture.hidden = true;

        clip.onerror = function () {
            // другий шлях (тека теми проти медіатеки) — остання спроба
            if (list.length > 1 && clip.getAttribute('src').indexOf(list[1]) !== 0) {
                clip.setAttribute('src', list[1] + '#t=0.5');

                return;
            }

            clip.onerror = null;
            clip.hidden = true;

            if (picture) { picture.hidden = false; picture.src = videoPlaceholder(); }
        };
    }

    function hideVideoFrame(tile) {
        var clip = tile.querySelector('video[data-media-frame]');
        var picture = tile.querySelector('img');

        if (clip) clip.hidden = true;
        if (picture) picture.hidden = false;
    }

    // плитка малює те, що в її полях
    function render(tile) {
        // Варіант із одним полем: і картинка, і відео лежать разом
        // (галерея hydrophob.net). Тип визначаємо за розширенням.
        var single = tile.querySelector('[data-media-file]');

        if (single) {
            var value = single.value.trim();
            var picture = tile.querySelector('img');
            var marker = tile.querySelector('[data-media-play]');
            var label = tile.querySelector('[data-media-caption]');
            var isVideo = VIDEO.test(value);

            if (isVideo) {
                showVideoFrame(tile, value);
            } else {
                hideVideoFrame(tile);

                if (picture) {
                    if (value) {
                        setImage(picture, value, placeholder(tile));
                    } else {
                        picture.onerror = null;
                        picture.src = placeholder(tile);
                    }
                }
            }

            if (marker) marker.hidden = !isVideo;
            if (label) label.textContent = value ? value.split('/').pop() : '';

            return;
        }

        var image = tile.querySelector('[data-media-image]');
        var video = tile.querySelector('[data-media-video]');
        var img = tile.querySelector('img');
        var play = tile.querySelector('[data-media-play]');
        var caption = tile.querySelector('[data-media-caption]');

        var imageValue = image ? image.value.trim() : '';
        var videoValue = video ? video.value.trim() : '';

        if (img) {
            if (imageValue) {
                // мініатюру ріже сам OpenCart; тут показуємо оригінал
                if (img.src.indexOf(imageValue) === -1) img.src = 'image/' + imageValue;
            } else if (videoValue) {
                img.src = videoPlaceholder();
            } else {
                img.src = placeholder(tile);
            }
        }

        if (play) play.hidden = !videoValue;

        if (caption) {
            var name = videoValue || imageValue;
            caption.textContent = name ? name.split('/').pop() : '';
        }
    }

    // після медіатеки шлях лежить у полі картинки — розкладаємо за типом
    function normalize(tile) {
        if (tile.querySelector('[data-media-file]')) {
            render(tile);
            return;
        }

        var image = tile.querySelector('[data-media-image]');
        var video = tile.querySelector('[data-media-video]');

        if (!image || !video) return;

        if (VIDEO.test(image.value.trim())) {
            video.value = image.value.trim();
            image.value = '';
        }

        render(tile);
    }

    function prepare(tile) {
        if (tile.hydroMediaReady) return;
        tile.hydroMediaReady = true;

        var link = tile.querySelector('[data-hydro-media]');
        var image = tile.querySelector('[data-media-file]') || tile.querySelector('[data-media-image]');

        // пікер шукає ціль по id — роздаємо їх самі
        if (image && !image.id) image.id = 'hydro-media-' + (++seq);
        if (link && !link.id) link.id = 'hydro-media-thumb-' + seq;

        render(tile);
    }

    function prepareAll() {
        document.querySelectorAll('.hydro-tile').forEach(prepare);
    }

    function normalizeAll() {
        document.querySelectorAll('.hydro-tile').forEach(normalize);
        document.dispatchEvent(new CustomEvent('hydro:media-change'));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', prepareAll);
    } else {
        prepareAll();
    }

    // медіатека закрилась — значення вже проставлені, розкладаємо їх
    if (window.jQuery) {
        window.jQuery(document).on('hidden.bs.modal', '#modal-image', function () {
            setTimeout(normalizeAll, 0);
        });
    }

    // Медіатека відкривається напряму — так само, як це робить common.js,
    // але без проміжного popover-а з олівцем.
    function openPicker(tile) {
        var link = tile.querySelector('[data-hydro-media]');
        var field = tile.querySelector('[data-media-file]') || tile.querySelector('[data-media-image]');

        if (!link || !field || !window.jQuery) return;

        var $ = window.jQuery;
        var token = (location.search.match(/user_token=([A-Za-z0-9]+)/) || [])[1] || '';

        $('#modal-image').remove();

        $.ajax({
            url: 'index.php?route=common/filemanager&user_token=' + token + '&target=' + field.id + '&thumb=' + link.id,
            dataType: 'html',
            success: function (html) {
                $('body').append('<div id="modal-image" class="modal">' + html + '</div>');
                $('#modal-image').modal('show');
            }
        });
    }

    // Клік по самій плитці одразу відкриває медіатеку: стоковий OpenCart
    // показував проміжний popover з олівцем, і з нього ще треба було влучити.
    // Слухаємо на етапі перехоплення й гасимо подію, щоб той popover не спливав.
    document.addEventListener('click', function (event) {
        var link = event.target.closest && event.target.closest('[data-hydro-media]');

        if (!link) return;

        var tile = link.closest('.hydro-tile');

        if (!tile) return;

        event.preventDefault();
        event.stopPropagation();

        prepare(tile);
        openPicker(tile);
    }, true);

    // Нова плитка: одразу відкриваємо медіатеку — порожня плитка сама по собі
    // нікому не потрібна. Якщо нічого не вибрали, плитка прибирається.
    document.addEventListener('click', function (event) {
        var add = event.target.closest('[data-repeater-add]');
        if (!add) return;

        var list = add.closest('.hydro-rep, form') && document.querySelector('.hydro-tiles');

        setTimeout(function () {
            prepareAll();

            if (!list) return;

            var tiles = list.querySelectorAll('.hydro-tile');
            var tile = tiles[tiles.length - 1];

            if (!tile) return;

            var field = tile.querySelector('[data-media-file]') || tile.querySelector('[data-media-image]');
            if (!field || field.value) return;

            tile.dataset.mediaFresh = '1';
            openPicker(tile);
        }, 0);
    });

    // порожню щойно додану плитку прибираємо, якщо вибір скасували
    if (window.jQuery) {
        window.jQuery(document).on('hidden.bs.modal', '#modal-image', function () {
            setTimeout(function () {
                document.querySelectorAll('.hydro-tile[data-media-fresh]').forEach(function (tile) {
                    var field = tile.querySelector('[data-media-file]') || tile.querySelector('[data-media-image]');
                    var video = tile.querySelector('[data-media-video]');

                    delete tile.dataset.mediaFresh;

                    if ((!field || !field.value) && (!video || !video.value)) tile.remove();
                });
            }, 30);
        });
    }

    // «прибрати» на плитці чистить обидва поля, а не лише картинку
    document.addEventListener('click', function (event) {
        var clear = event.target.closest('[data-media-clear]');
        if (!clear) return;

        var tile = clear.closest('.hydro-tile');
        if (!tile) return;

        event.preventDefault();

        var single = tile.querySelector('[data-media-file]');
        var image = tile.querySelector('[data-media-image]');
        var video = tile.querySelector('[data-media-video]');

        if (single) single.value = '';
        if (image) image.value = '';
        if (video) video.value = '';

        render(tile);
    });

    /* Поле-рядок зі шляхом до файлу: кнопка поруч відкриває ту саму
       медіатеку. Використовують модулі, де медіа не плиткою, а полем
       (герої, тизер) — щоб шлях не доводилось писати руками. */
    document.addEventListener('click', function (event) {
        var button = event.target.closest('[data-media-pick]');

        if (!button || !window.jQuery) return;

        event.preventDefault();

        var $ = window.jQuery;
        var target = button.getAttribute('data-media-pick');
        var token = (location.search.match(/user_token=([A-Za-z0-9]+)/) || [])[1] || '';

        $('#modal-image').remove();

        $.ajax({
            url: 'index.php?route=common/filemanager&user_token=' + token + '&target=' + target,
            dataType: 'html',
            success: function (html) {
                $('body').append('<div id="modal-image" class="modal">' + html + '</div>');
                $('#modal-image').modal('show');
            }
        });
    });

    window.hydroMediaInit = function () {
        prepareAll();
        normalizeAll();
    };
})();
