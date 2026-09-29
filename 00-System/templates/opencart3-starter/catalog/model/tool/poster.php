<?php
/**
 * Постер відео — кадр із самого ролика, а не окремо завантажена картинка.
 *
 * Кадр ріжеться один раз і лягає в image/catalog/video-posters/. Імʼя містить
 * відбиток шляху, секунди й часу зміни файлу, тому:
 *   • той самий ролик із тією ж секундою не переріжеться вдруге;
 *   • змінили секунду або перезалили відео — зʼявиться новий кадр, старий
 *     просто перестане використовуватись.
 *
 * Якщо ffmpeg недоступний або кадр не зчитався, метод повертає порожній рядок,
 * і викликач показує блок без постера — сторінка від цього не ламається.
 */
class ModelToolPoster extends Model {
	// скільки сторінка згодна чекати на кадр, перш ніж віддати сторінку без
	// нього; важкий ролик дорізається у фоні й зʼявиться наступного разу
	const TIMEOUT = 3;
	const BACKGROUND = 120;

	/**
	 * @param string $video  шлях від кореня сайту: 'image/catalog/x.mp4'
	 *                       або 'catalog/view/theme/<тема>/image/video/x.mp4'
	 * @param float  $second з якої секунди брати кадр
	 * @return string        шлях до постера від кореня сайту, або ''
	 */
	public function get($video, $second = 1) {
		$video = trim(html_entity_decode((string)$video, ENT_QUOTES, 'UTF-8'));

		if ($video === '') {
			return '';
		}

		$source = DIR_APPLICATION . '../' . ltrim($video, '/');

		if (!is_file($source)) {
			return '';
		}

		$second = $this->second($second);

		$name = preg_replace('/[^a-z0-9._-]+/i', '-', basename($video));
		$name = pathinfo($name, PATHINFO_FILENAME);
		$stamp = substr(md5($video . '|' . $second . '|' . filemtime($source)), 0, 8);

		$file = $name . '-' . $stamp . '.webp';
		$relative = $this->folder() . $file;
		$target = DIR_IMAGE . $relative;

		if (is_file($target)) {
			return 'image/' . $relative;
		}

		if (!$this->render($source, $target, $second)) {
			return '';
		}

		return 'image/' . $relative;
	}

	/**
	 * Готовий до вставки в <img>: постер, прогнаний через штатний ресайзер,
	 * щоб у розмітку не йшов кадр у повному розмірі.
	 */
	public function thumb($video, $second = 1, $width = 960, $height = 0) {
		$poster = $this->get($video, $second);

		if ($poster === '') {
			return '';
		}

		$relative = substr($poster, strlen('image/'));
		$info = @getimagesize(DIR_IMAGE . $relative);

		if (!$info || $info[0] <= $width) {
			return $poster;
		}

		if (!$height) {
			$height = (int)round($width * $info[1] / $info[0]);
		}

		$this->load->model('tool/image');

		return $this->model_tool_image->resize($relative, $width, $height);
	}

	/**
	 * Куди складати кадри. Штатне місце — image/catalog/video-posters/, але
	 * на частині сайтів тека image/catalog належить не тому користувачу, під
	 * яким працює PHP, і створити в ній нічого не можна. Тоді йдемо в
	 * image/cache/, куди пише штатний ресайзер: кадр — такий самий кеш, його
	 * не шкода втратити при очищенні.
	 */
	private function folder() {
		$places = array('catalog/video-posters/', 'cache/video-posters/');

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

		return 'cache/video-posters/';
	}

	// секунда з форми: порожнє поле, кома замість крапки, від'ємне значення
	private function second($value) {
		$value = str_replace(',', '.', trim((string)$value));

		if ($value === '' || !is_numeric($value)) {
			return 1.0;
		}

		return max(0, (float)$value);
	}

	private function render($source, $target, $second) {
		$dir = dirname($target);

		if (!is_dir($dir) && !@mkdir($dir, 0755, true)) {
			return false;
		}

		if (!is_writable($dir)) {
			return false;
		}

		// -ss перед -i: ffmpeg перемотує по ключових кадрах, це швидко
		$command = 'ffmpeg -y -ss ' . escapeshellarg((string)$second)
			. ' -i ' . escapeshellarg($source)
			. ' -frames:v 1 -q:v 4 ' . escapeshellarg($target) . ' 2>/dev/null';

		$this->run($command, self::TIMEOUT);

		if ($this->ready($target)) {
			return true;
		}

		// не вклались у відведений час — дорізаємо у фоні, сторінку не тримаємо
		@unlink($target);

		$this->background($command);

		return false;
	}

	private function ready($target) {
		clearstatcache(true, $target);

		return is_file($target) && filesize($target) > 0;
	}

	private function run($command, $timeout) {
		if (!function_exists('exec')) {
			return;
		}

		@exec('timeout ' . (int)$timeout . ' ' . $command);
	}

	// та сама команда, але відвʼязана від запиту
	private function background($command) {
		if (!function_exists('exec')) {
			return;
		}

		@exec('nohup timeout ' . self::BACKGROUND . ' ' . $command . ' >/dev/null 2>&1 &');
	}
}
