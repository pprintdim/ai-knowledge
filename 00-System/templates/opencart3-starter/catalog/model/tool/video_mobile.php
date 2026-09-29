<?php
/**
 * Мобільний варіант відео — той самий ролик, тільки легший.
 *
 * На ПК ми завжди віддаємо оригінал так, як його залили (нічого не чіпаємо).
 * Для телефона з нього один раз готується копія не більше 1280px по довгій
 * стороні і з розумним бітрейтом: на екрані різниці не видно, а важить вона
 * у кілька разів менше.
 *
 * Що важливо розуміти про час життя запиту:
 *   • перекодування — це хвилини, сторінку на нього не тримаємо НІКОЛИ;
 *   • перший рендер лише ставить задачу у фонову чергу і віддає порожній
 *     рядок, тобто телефон того разу отримує оригінал;
 *   • коли копія готова, вона просто зʼявляється в кеші й далі віддається
 *     без жодного exec — у стійкому стані метод робить лише is_file().
 *
 * Кеш лежить поряд із постерами і має три види файлів:
 *   <імʼя>-<відбиток>.mp4   готовий варіант
 *   <імʼя>-<відбиток>.none  джерело варіанта не потребує (копія вийшла не
 *                           легшою за оригінал) — більше не пробуємо
 *   <імʼя>-<відбиток>.lock  задача вже в черзі
 *
 * Відбиток містить шлях, час зміни й розмір джерела, тому перезалили ролик —
 * зʼявиться новий варіант, а старий просто перестане використовуватись.
 */
class ModelToolVideoMobile extends Model {
	// довга сторона мобільної копії
	const WIDTH = 1280;

	// постійна якість. 23 — точка, після якої SSIM відносно оригіналу вже не
	// росте (0.992), а вага росте; це «менша якість без втрат» на око
	const CRF = 23;

	// менші файли перекодовувати немає сенсу
	const MIN_BYTES = 1200000;

	// копія має бути відчутно легшою, інакше вона не потрібна
	const GAIN = 85;

	// стеля часу на одну задачу і на очікування в черзі
	const LIMIT = 2400;
	const QUEUE = 1800;

	private $extensions = array('mp4', 'webm', 'mov', 'm4v');

	/**
	 * @param string $video шлях від кореня сайту:
	 *                      'image/catalog/x.mp4' або
	 *                      'catalog/view/theme/<тема>/image/video/x.mp4'
	 * @return string       шлях до мобільного варіанта від кореня сайту,
	 *                      або '' якщо варіанта немає (тоді віддаємо оригінал)
	 */
	public function get($video) {
		$video = trim(html_entity_decode((string)$video, ENT_QUOTES, 'UTF-8'));
		$video = ltrim(preg_replace('/[?#].*$/', '', $video), '/');

		if ($video === '' || strpos($video, '..') !== false) {
			return '';
		}

		$extension = strtolower(pathinfo($video, PATHINFO_EXTENSION));

		if (!in_array($extension, $this->extensions)) {
			return '';
		}

		// сам мобільний варіант удруге не зменшуємо
		if (preg_match('/-mobile(-[a-f0-9]+)?$/i', pathinfo($video, PATHINFO_FILENAME))) {
			return '';
		}

		$source = DIR_APPLICATION . '../' . $video;

		if (!is_file($source)) {
			return '';
		}

		$size = filesize($source);

		if ($size < self::MIN_BYTES) {
			return '';
		}

		// готовий варіант, зроблений руками, має перевагу — але тільки якщо він
		// справді легший (у темах лежать «мобільні» файли, ідентичні оригіналу)
		$manual = $this->manual($video, $extension, $size);

		if ($manual !== '') {
			return $manual;
		}

		$name = preg_replace('/[^a-z0-9._-]+/i', '-', pathinfo($video, PATHINFO_FILENAME));
		$stamp = substr(md5($video . '|' . filemtime($source) . '|' . $size . '|' . self::WIDTH . '|' . self::CRF), 0, 10);

		$relative = $this->folder() . $name . '-mobile-' . $stamp . '.mp4';
		$target = DIR_IMAGE . $relative;

		if ($this->ready($target)) {
			return 'image/' . $relative;
		}

		// джерело вже достатньо легке — перевірено перекодуванням, не повторюємо
		if (is_file(substr($target, 0, -4) . '.none')) {
			return '';
		}

		$this->queue($source, $target, $size);

		return '';
	}

	/**
	 * Зручний варіант для місць, де потрібен один шлях: мобільна копія, якщо
	 * вона є, інакше сам оригінал.
	 */
	public function src($video) {
		$mobile = $this->get($video);

		return $mobile !== '' ? $mobile : $video;
	}

	// <імʼя>-mobile.<розширення> поряд із джерелом
	private function manual($video, $extension, $size) {
		$sibling = preg_replace('/\.' . preg_quote($extension, '/') . '$/i', '-mobile.' . $extension, $video);

		if ($sibling === $video) {
			return '';
		}

		$file = DIR_APPLICATION . '../' . $sibling;

		if (!is_file($file)) {
			return '';
		}

		return filesize($file) < $size * self::GAIN / 100 ? $sibling : '';
	}

	/**
	 * Куди складати копії. Штатне місце — image/catalog/video-mobile/, але на
	 * частині сайтів тека image/catalog належить не тому користувачу, під яким
	 * працює PHP. Тоді йдемо в image/cache/, куди пише штатний ресайзер.
	 */
	private function folder() {
		$places = array('catalog/video-mobile/', 'cache/video-mobile/');

		foreach ($places as $place) {
			$dir = DIR_IMAGE . $place;

			if (is_dir($dir) && is_writable($dir)) {
				return $place;
			}

			$parent = dirname(rtrim($dir, '/'));

			if (is_dir($parent) && is_writable($parent)) {
				return $place;
			}
		}

		return 'cache/video-mobile/';
	}

	private function ready($target) {
		clearstatcache(true, $target);

		return is_file($target) && filesize($target) > 0;
	}

	/**
	 * Ставимо задачу у фонову чергу. Черга — один flock на теку кешу: на
	 * сервері два ядра, паралельні ffmpeg поклали б сайт, тому задачі йдуть
	 * одна за одною і з найнижчим приоритетом.
	 */
	private function queue($source, $target, $size) {
		if (!function_exists('exec')) {
			return;
		}

		$dir = dirname($target);

		if (!is_dir($dir) && !@mkdir($dir, 0755, true)) {
			return;
		}

		if (!is_writable($dir)) {
			return;
		}

		$lock = substr($target, 0, -4) . '.lock';

		// задача вже в роботі; застарілий замок (процес помер) знімаємо самі
		if (is_file($lock)) {
			if (time() - filemtime($lock) < self::LIMIT) {
				return;
			}

			@unlink($lock);
		}

		if (!@touch($lock)) {
			return;
		}

		$temp = substr($target, 0, -4) . '.part.mp4';
		$none = substr($target, 0, -4) . '.none';

		$ffmpeg = 'ffmpeg -y -hide_banner -loglevel error'
			. ' -i ' . escapeshellarg($source)
			. ' -map 0:v:0 -map 0:a:0?'
			. ' -vf ' . escapeshellarg('scale=w=' . self::WIDTH . ':h=' . self::WIDTH . ':force_original_aspect_ratio=decrease:force_divisible_by=2:flags=lanczos')
			. ' -c:v libx264 -crf ' . self::CRF . ' -preset medium -profile:v high -pix_fmt yuv420p -g 48'
			. ' -c:a aac -b:a 96k -ac 2'
			. ' -movflags +faststart'
			. ' ' . escapeshellarg($temp);

		// Три умови, щоб копія лишилась: файл є, він відчутно легший за оригінал
		// і він ПОВНИЙ. Останнє важливо: якби ffmpeg обірвався (timeout, брак
		// місця, битий кадр), огризок теж був би «легшим» і поїхав би на сайт.
		//
		// Обірваний файл просто видаляємо, без позначки `.none` — наступний
		// рендер поставить задачу знову. Позначку ставимо лише коли копія вийшла
		// повною, але не легшою: тоді цей ролик варіанта справді не потребує.
		$duration = 'ffprobe -v error -show_entries format=duration -of csv=p=0';

		$script = $ffmpeg . ' >/dev/null 2>&1; '
			. 'made=$(wc -c < ' . escapeshellarg($temp) . ' 2>/dev/null || echo 0); '
			. 'was=$(' . $duration . ' ' . escapeshellarg($source) . ' 2>/dev/null || echo 0); '
			. 'now=$(' . $duration . ' ' . escapeshellarg($temp) . ' 2>/dev/null || echo 0); '
			. 'full=$(awk -v a="$now" -v b="$was" \'BEGIN { print (b > 0 && a >= b * 0.98) ? 1 : 0 }\'); '
			. 'if [ "$full" = "1" ] && [ "$made" -gt 0 ] && [ "$made" -lt ' . (int)floor($size * self::GAIN / 100) . ' ]; then '
			. 'mv -f ' . escapeshellarg($temp) . ' ' . escapeshellarg($target) . '; '
			. 'elif [ "$full" = "1" ]; then '
			. 'rm -f ' . escapeshellarg($temp) . '; : > ' . escapeshellarg($none) . '; '
			. 'else rm -f ' . escapeshellarg($temp) . '; fi; '
			. 'rm -f ' . escapeshellarg($lock);

		$command = 'nohup nice -n 19 timeout ' . self::LIMIT
			. ' flock -w ' . self::QUEUE . ' ' . escapeshellarg($dir . '/.queue')
			. ' /bin/sh -c ' . escapeshellarg($script)
			. ' >/dev/null 2>&1 &';

		@exec($command);
	}
}
