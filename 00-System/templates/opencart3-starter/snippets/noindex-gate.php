<?php
/* Гейт індексації у catalog/controller/common/header.php.
   Чекбокс `config_noindex` у Налаштування → Сервер. Тримати УВІМКНЕНИМ від
   першого дня посадки й знімати лише на запуску, разом із підміною robots.txt. */

	// from seo_meta — private routes (cart, checkout, account, search), sort and
	// limit duplicates, manual rules. robots.txt says much of the same, but a
	// Disallow only stops the crawl: a page linked from elsewhere can still be
	// indexed without being fetched, and only the meta tag settles that.
	private function robots() {
		if ($this->config->get('config_noindex')) {
			return 'noindex, nofollow';
		}

		if ($this->registry->has('seo_meta_robots')) {
			return (string)$this->registry->get('seo_meta_robots');
		}

		$meta = $this->load->controller('extension/module/seo_meta');

		return is_array($meta) ? (string)($meta['robots'] ?? '') : '';
	}

