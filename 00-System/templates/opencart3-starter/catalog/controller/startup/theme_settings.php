<?php
/**
 * Підстраховка налаштувань теми.
 *
 * Тема магазину — власна тека (`config_theme` = `hydrophob`), а не встановлене
 * розширення. Стокові контролери читають розміри картинок і ліміти як
 * `theme_<назва теми>_image_product_width` тощо, і якщо такої групи налаштувань
 * у базі немає, у `Image::resize()` прилітає null — фатальна помилка на картці
 * товару й у каталозі (PHP 8 більше не приймає null там, де очікується int).
 *
 * Тут ми не чіпаємо базу: чого бракує для поточної теми — беремо з групи
 * `theme_default`, яка є в будь-якому магазині. Значення, що справді задані для
 * теми, лишаються як є, тому налаштування з адмінки нічого не перебиває.
 */
class ControllerStartupThemeSettings extends Controller {
	public function index() {
		$theme = (string)$this->config->get('config_theme');

		if ($theme === '' || $theme === 'default') {
			return;
		}

		$keys = array(
			'status', 'directory', 'product_limit', 'product_description_length',
			'image_category_width', 'image_category_height',
			'image_thumb_width', 'image_thumb_height',
			'image_popup_width', 'image_popup_height',
			'image_product_width', 'image_product_height',
			'image_additional_width', 'image_additional_height',
			'image_related_width', 'image_related_height',
			'image_compare_width', 'image_compare_height',
			'image_wishlist_width', 'image_wishlist_height',
			'image_cart_width', 'image_cart_height',
			'image_location_width', 'image_location_height'
		);

		foreach ($keys as $key) {
			$own = 'theme_' . $theme . '_' . $key;

			if ($this->config->get($own) !== null) {
				continue;
			}

			$fallback = $this->config->get('theme_default_' . $key);

			if ($fallback !== null) {
				$this->config->set($own, $fallback);
			}
		}

		// тека шаблонів у будь-якому разі — сама тема, а не те, що записано
		// в `theme_default_directory`
		$this->config->set('theme_' . $theme . '_directory', $theme);
	}
}
