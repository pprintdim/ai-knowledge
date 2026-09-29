<?php
/* Фрагменти для system/config/catalog.php нового проєкту.
   Реєструємо своє кодом, а не рядками в oc_event: тема має приїжджати файлами
   й не залежати від стану БД. */

// 1) startup-контролери. `startup/theme_settings` підставляє відсутні
//    theme_<тема>_* зі стокової групи theme_default — без нього каталог падає,
//    якщо тема задана текою, а не встановленим розширенням.
$_['action_pre_action']  = array(
	'startup/session',
	'startup/startup',
	'startup/error',
	'startup/event',
	'startup/maintenance',
	'startup/theme_settings',
	'startup/seo_url'
);

// 2) події. `event/video_mobile` на виході кожного шаблону підміняє важкі
//    ролики легкими копіями на телефоні.
$_['action_event'] = array(
	'controller/*/before' => array(
		'event/language/before'
	),
	'controller/*/after' => array(
		'event/language/after'
	),	
	'view/*/before' => array(
		500  => 'event/theme',
		998  => 'event/language',
	),
	'view/*/after' => array(
		'event/video_mobile'
	),
	'language/*/after' => array(
		'event/translation'
	),
	//'view/*/before' => array(
	//	1000  => 'event/debug/before'
	//),
	//'controller/*/after'  => array(
	//	'event/debug/after'
//	)
);
