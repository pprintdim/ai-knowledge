<?php
// php render_bag_test.php <site_root> <out.html> [manual] — локальна тестова сторінка секції з реального twig (товари — макет)
error_reporting(0);
$root = rtrim($argv[1], '/'); $out = $argv[2]; $manual = !empty($argv[3]);
chdir($root);
require 'system/storage/vendor/autoload.php';
$tw = new \Twig\Environment(new \Twig\Loader\FilesystemLoader('catalog/view/theme/realchem/template'), ['autoescape' => false]);
preg_match("/<<<'REALCHEM_JSON'\n(.*?)\nREALCHEM_JSON/s", file_get_contents('rc_panel/model/extension/module/home_bag.php'), $m);
$d = json_decode($m[1], true); $c = $d['content']['uk-ua'];
$v = time(); $p = 'catalog/view/theme/realchem/model/';
$prices = [1 => '1 180,00 ₴', 2 => '980,00 ₴', 3 => '890,00 ₴', 4 => '750,00 ₴', 5 => '640,00 ₴'];
$vol = [1 => '250 мл', 2 => '100 мл', 3 => '2×100 мл', 4 => '100 мл', 5 => '150 мл'];
$slides = []; $labels = []; $keys = ['bag'];
foreach ($c['products'] as $row) {
    $id = (int)$row['product_id']; $model = $row['model'];
    $poster = $p . 'poster-' . $model . '.webp';
    $slides[] = array_merge($row, ['type' => $model === 'gel' ? 'gel' : ($model === 'foam' ? 'foam' : 'spray'),
        'product' => ['product_id' => $id, 'name' => $row['title'], 'href' => '#p' . $id, 'price' => $prices[$id], 'special' => false, 'volume' => $vol[$id], 'raw_price' => 1, 'minimum' => 1, 'in_cart' => false],
        'poster' => is_file($poster) ? $poster . '?v=' . $v : '']);
    $labels[$model] = $p . 'labels/' . $model . '.webp?v=' . $v; $keys[] = $model;
}
$lang = ['text_prev' => 'Попередній слайд', 'text_next' => 'Наступний слайд', 'text_goto' => 'Слайд %s', 'text_cart' => 'В кошик', 'text_added' => 'Додано', 'text_more' => 'Детальніше', 'hint_bag' => 'натисніть на мішечок', 'hint_spray' => 'натисніть — пшикне', 'hint_gel' => 'натисніть — вичавить гель', 'hint_foam' => 'натисніть — дасть піну'];
$h = $tw->render('extension/module/home_bag.twig', array_merge($lang, ['content' => $c, 'model_url' => $p . 'realchem-bag.glb?v=' . $v, 'albedo_url' => $p . 'bag-albedo.webp?v=' . $v, 'normal_url' => $p . 'bag-normal.webp?v=' . $v, 'logo_url' => $p . 'bag-logo.svg?v=' . $v, 'poster_url' => $p . 'bag-poster.webp?v=' . $v, 'video_webm_url' => $p . 'bag-wind.webm?v=' . $v, 'video_hevc_url' => $p . 'bag-wind.mp4?v=' . $v, 'script_version' => $v, 'shop' => '/shop', 'product_slides' => $slides, 'slide_keys' => implode(',', $keys), 'labels_json' => json_encode($labels, JSON_UNESCAPED_SLASHES)]));
if ($manual) $h = str_replace('<section class="rc-bag" data-bag ', '<section class="rc-bag" data-bag data-bag-manual ', $h);
file_put_contents($out, "<!DOCTYPE html><html lang=uk><head><meta charset=UTF-8><meta name=viewport content=\"width=device-width, initial-scale=1\"><link rel=stylesheet href=\"catalog/view/theme/realchem/stylesheet/fonts.css\"><link rel=stylesheet href=\"catalog/view/theme/realchem/stylesheet/style.css\"><link rel=stylesheet href=\"catalog/view/theme/realchem/stylesheet/custom.css?v=$v\"></head><body style=\"margin:0\">$h</body></html>");
echo "ok ", strlen($h), "\n";
