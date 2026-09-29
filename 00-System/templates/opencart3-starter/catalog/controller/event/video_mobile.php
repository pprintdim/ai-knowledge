<?php
/**
 * Мобільні відео — підміна джерела на телефоні.
 *
 * Подія висить на `view/*∕after`, тобто бачить готовий HTML кожного шаблону.
 * Для кожного носія шляху до ролика (`<video>` і кнопки лайтбокса/попапа)
 * питаємо в `tool/video_mobile` легку копію і, якщо вона вже готова, дописуємо
 * тегу `data-mobile-src`. Сам вибір робить браузер: у <head> сторінки один раз
 * вкладається коротенький перемикач, який на телефоні переписує атрибути.
 *
 * Чому подією, а не в кожному контролері: роликів у темах близько двох
 * десятків і вони приходять з різних модулів (герой, галерея, промо,
 * вітальна накладка, картки товарів). Один фільтр на виході покриває їх усі,
 * включно з тими, що зʼявляться потім.
 *
 * Чого фільтр НЕ торкається: тегів, у яких тема вже сама керує мобільним
 * джерелом (`data-mobile-src` / `data-src-mobile` у шаблоні). Там підміну
 * робить її власний скрипт, і лізти туди означало б ламати його логіку.
 */
class ControllerEventVideoMobile extends Controller {
	// перемикач вкладається один раз на запит
	private static $injected = false;

	// телефон чи ні — визначаємо раз на запит
	private static $phone = null;

	// атрибути, у яких тема тримає шлях до ролика. Крім самого <video> це ще
	// кнопки, що відкривають ролик у лайтбоксі або попапі — там ваги найбільше,
	// бо клікають уже на повний екран
	private $attributes = array('src', 'data-src', 'data-mp4', 'data-desktop-src', 'data-lazy-src', 'data-video', 'data-lightbox-src');

	public function index(&$route, &$data, &$output) {
		if (!is_string($output)) {
			return;
		}

		// Перемикач ставимо в <head>, а не поряд із розміткою: тег із
		// `autoplay` або `preload="auto"` починає тягнути файл одразу, як
		// парсер його побачив, тож переписати атрибути треба раніше. З голови
		// сторінки спостерігач встигає — він працює мікрозадачею, а завантаження
		// медіа браузер ставить у звичайну чергу задач.
		// на телефоні перемикач не потрібен: там підміна вже в розмітці
		if (!self::$injected && !$this->phone() && stripos($output, '</head>') !== false) {
			$output = preg_replace('/<\/head>/i', $this->script() . '</head>', $output, 1);

			self::$injected = true;
		}

		if (!preg_match('/\.(?:mp4|webm|mov|m4v)"/i', $output)) {
			return;
		}

		$this->load->model('tool/video_mobile');

		$injected = false;

		$carriers = implode('|', array_map(function ($name) {
			return preg_quote($name, '/');
		}, $this->attributes));

		$pattern = '/<[a-z][a-z0-9]*\b[^>]*?\b(?:' . $carriers . ')\s*=\s*"[^"]+\.(?:mp4|webm|mov|m4v)"[^>]*>/i';

		$output = preg_replace_callback($pattern, function ($match) use (&$injected) {
			$tag = $match[0];

			// Вітальна накладка тримає мобільний шлях сама (`data-src-mobile`) і
			// теж стоїть із `preload="auto"`, тому з телефона підміняємо одразу
			// в розмітці — її власний скрипт зробить те саме, але вже запізно.
			if ($this->phone() && preg_match('/\bdata-src-mobile\s*=\s*"([^"]+)"/i', $tag, $hand) && trim($hand[1]) !== '') {
				return $this->swap($tag, trim($hand[1]));
			}

			// тема сама знає про мобільний варіант — не заважаємо
			if (stripos($tag, 'data-mobile-src') !== false || stripos($tag, 'data-src-mobile') !== false) {
				return $tag;
			}

			$video = $this->path($tag);

			if ($video === '') {
				return $tag;
			}

			$mobile = $this->model_tool_video_mobile->get($video);

			if ($mobile === '') {
				return $tag;
			}

			// З телефона підміняємо одразу в розмітці. Інакше тег із `autoplay`
			// або `preload="auto"` встигає почати завантаження важкого файлу
			// раніше за будь-який скрипт — перевірено на живій сторінці.
			if ($this->phone()) {
				return $this->swap($tag, $mobile);
			}

			// решта (вузьке вікно на ПК, планшет, невідомий агент) — перемикачем
			$injected = true;

			return rtrim(substr($tag, 0, -1), '/')
				. ' data-mobile-src="' . htmlspecialchars($mobile, ENT_QUOTES, 'UTF-8') . '" data-mobile-auto="1">';
		}, $output);

		// відповідь без <head> (ajax-частина сторінки) — тоді перемикач іде
		// просто за розміткою
		if ($injected && !self::$injected) {
			self::$injected = true;

			$output .= $this->script();
		}
	}

	/**
	 * Телефон це чи ні. Планшети й вузькі вікна на ПК сюди не входять: там
	 * лишається десктопний ролик і перемикач, бо екран може стати широким.
	 *
	 * Сніфінг агента тут безпечний: сторінки цих сайтів не кешуються (сесія,
	 * кошик, валюта — у кожній відповіді своє), тож віддати різну розмітку
	 * різним пристроям нічим не загрожує.
	 */
	private function phone() {
		if (self::$phone === null) {
			$agent = isset($this->request->server['HTTP_USER_AGENT']) ? (string)$this->request->server['HTTP_USER_AGENT'] : '';

			self::$phone = $agent !== ''
				&& !preg_match('/iPad|Tablet/i', $agent)
				&& (bool)preg_match('/iPhone|iPod|Windows Phone|Android.*Mobile|Mobi/i', $agent);
		}

		return self::$phone;
	}

	/**
	 * Підміна шляхів у самому тезі: усі носії показують на легку копію, а
	 * webm-альтернатива прибирається (копія завжди mp4).
	 */
	private function swap($tag, $mobile) {
		$carriers = implode('|', array_map(function ($name) {
			return preg_quote($name, '/');
		}, $this->attributes));

		$tag = preg_replace_callback('/\b(' . $carriers . ')\s*=\s*"[^"]+\.(?:mp4|webm|mov|m4v)"/i', function ($found) use ($mobile) {
			return $found[1] . '="' . htmlspecialchars($mobile, ENT_QUOTES, 'UTF-8') . '"';
		}, $tag);

		$tag = preg_replace('/\bdata-webm\s*=\s*"[^"]*"/i', 'data-webm=""', $tag);

		return rtrim(substr($tag, 0, -1), '/') . ' data-mobile-done="1">';
	}

	/**
	 * Шлях до ролика з атрибутів тега. Беремо перший mp4 (він є завжди), а
	 * webm — лише коли mp4 у теге немає взагалі.
	 */
	private function path($tag) {
		$carriers = implode('|', array_map(function ($name) {
			return preg_quote($name, '/');
		}, $this->attributes));

		if (!preg_match_all('/\b(?:' . $carriers . ')\s*=\s*"([^"]+\.(?:mp4|webm|mov|m4v))"/i', $tag, $found)) {
			return '';
		}

		foreach ($found[1] as $value) {
			if (preg_match('/\.mp4$/i', $value)) {
				return $value;
			}
		}

		return $found[1][0];
	}

	/**
	 * Перемикач. Переписує атрибути раніше, ніж за них візьметься скрипт теми
	 * (лінива підгрузка читає `data-src`/`data-mp4` на DOMContentLoaded) і
	 * раніше, ніж браузер почне тягнути тег із `autoplay`/`preload="auto"`.
	 *
	 * Спостерігач ловить ролики, що приходять з наступних шаблонів і з JS;
	 * через 2 с після `load` відключається. Якщо `src` таки підмінено вже після
	 * старту завантаження, `load()` перемикає елемент на легкий файл.
	 */
	private function script() {
		return "\n" . '<script>' . "\n"
			. '(function () {' . "\n"
			. '    if (window.hydroVideoMobile) return;' . "\n"
			. '    window.hydroVideoMobile = 1;' . "\n"
			. '    var mq = window.matchMedia && window.matchMedia(\'(max-width: 767px)\');' . "\n"
			. '    if (!mq || !mq.matches) return;' . "\n"
			. '    var ATTRS = ' . json_encode($this->attributes) . ';' . "\n"
			. '    function apply(el) {' . "\n"
			. '        if (!el || el.getAttribute(\'data-mobile-done\')) return;' . "\n"
			. '        var mobile = el.getAttribute(\'data-mobile-src\');' . "\n"
			. '        if (!mobile) return;' . "\n"
			. '        el.setAttribute(\'data-mobile-done\', \'1\');' . "\n"
			. '        var reload = false;' . "\n"
			. '        ATTRS.forEach(function (name) {' . "\n"
			. '            var value = el.getAttribute(name);' . "\n"
			. '            if (!value || value === mobile || !/\\.(mp4|webm|mov|m4v)(\\?|$)/i.test(value)) return;' . "\n"
			. '            if (name === \'src\' && el.tagName === \'VIDEO\') reload = true;' . "\n"
			. '            el.setAttribute(name, mobile);' . "\n"
			. '        });' . "\n"
			. '        if (el.hasAttribute(\'data-webm\')) el.setAttribute(\'data-webm\', \'\');' . "\n"
			. '        if (reload) { try { el.load(); } catch (e) {} }' . "\n"
			. '    }' . "\n"
			. '    function scan(root) {' . "\n"
			. '        if (!root || !root.querySelectorAll) return;' . "\n"
			. '        var list = root.querySelectorAll(\'[data-mobile-auto]\');' . "\n"
			. '        for (var i = 0; i < list.length; i++) apply(list[i]);' . "\n"
			. '    }' . "\n"
			. '    scan(document);' . "\n"
			. '    var watcher = null;' . "\n"
			. '    if (window.MutationObserver) {' . "\n"
			. '        watcher = new MutationObserver(function (records) {' . "\n"
			. '            for (var i = 0; i < records.length; i++) {' . "\n"
			. '                var added = records[i].addedNodes;' . "\n"
			. '                for (var j = 0; j < added.length; j++) {' . "\n"
			. '                    var node = added[j];' . "\n"
			. '                    if (!node || node.nodeType !== 1) continue;' . "\n"
			. '                    if (node.getAttribute && node.getAttribute(\'data-mobile-auto\')) apply(node);' . "\n"
			. '                    scan(node);' . "\n"
			. '                }' . "\n"
			. '            }' . "\n"
			. '        });' . "\n"
			. '        watcher.observe(document.documentElement, { childList: true, subtree: true });' . "\n"
			. '    }' . "\n"
			. '    document.addEventListener(\'DOMContentLoaded\', function () { scan(document); });' . "\n"
			. '    window.addEventListener(\'load\', function () {' . "\n"
			. '        scan(document);' . "\n"
			. '        window.setTimeout(function () { if (watcher) watcher.disconnect(); }, 2000);' . "\n"
			. '    });' . "\n"
			. '})();' . "\n"
			. '</script>' . "\n";
	}
}
