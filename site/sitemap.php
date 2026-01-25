<?php
header("Content-Type: application/xml; charset=UTF-8");

$baseUrl = "https://projet2fdp.xo.je/";

echo '<?xml version="1.0" encoding="UTF-8"?>';
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

$directory = __DIR__;
$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($directory)
);

foreach ($files as $file) {
    if ($file->isFile() && pathinfo($file, PATHINFO_EXTENSION) === "html") {
        $path = str_replace($directory, "", $file->getPathname());
        $url = $baseUrl . str_replace("\\", "/", $path);

        echo "<url>";
        echo "<loc>$url</loc>";
        echo "<lastmod>" . date("Y-m-d", filemtime($file)) . "</lastmod>";
        echo "<priority>0.8</priority>";
        echo "</url>";
    }
}

echo "</urlset>";
