# OC3 — Events vs OCMOD

Два механізми модифікації без правки ядра. Вибір: **event, якщо є hook-точка; OCMOD — коли треба міняти код, де hook-а нема.** Пряма правка ядра — останній варіант (у натяжках із власною темою часто прийнятна, бо repo свій).

## Event system

- Таблиця `oc_event`: code, trigger, action, status, sort_order.
- Trigger-формат: `catalog/controller/checkout/cart/add/before` (або `/after`), також `model/...` і `view/.../before|after`.
- Action = route обробника: `extension/module/mymod/onCartAdd`.
- Обробник: `public function onCartAdd(&$route, &$args, &$output)` — аргументи за референсом.
- Реєстрація в install() модуля: `$this->model_setting_event->addEvent($code, $trigger, $action)`.
- Приклад із ядра: `ControllerEventLanguage` — мовний merge у twig ([[twig]]).

## OCMOD

- XML-модифікації в таблиці `oc_modification`; застосовані копії файлів — `system/storage/modification/`.
- Loader спочатку шукає файл у `storage/modification/`, потім оригінал.
- Після зміни/встановлення — Dashboard → Extensions → Modifications → **Refresh** (перегенеровує копії). Без refresh зміни не живуть.
- Дебаг «правлю файл — нічого не міняється»: перевір, чи не перекриває його копія в `storage/modification/`.
- Маркетплейс-модулі (ocmod.zip) кладуть файли через `install/` + xml.

## Пастки

- Кнопка «⚡ Кеш» (наш admin QoL-патерн) чистить і кеш, і модифікації разом — ставити в кожну натяжку.
- Вимкнений event (status=0) мовчки вимикає функціонал — при дивній поведінці перевіряти `oc_event`.
- Порядок OCMOD-ів залежить від sort_order — конфлікти двох модифікацій одного файлу дебажити по фінальній копії в storage/modification.
