<?php
// Désactiver TOUT affichage d'erreur (obligatoire pour XML)
ini_set('display_errors', 0);
error_reporting(0);

header("Content-Type: application/xml; charset=UTF-8");

$baseUrl = "https://projet2fdp.xo.je";

echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
echo "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";

$directory = __DIR__;

$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS)
);

foreach ($iterator as $file) {
    if ($file->isFile() && strtolower($file->getExtension()) === "html") {

        $path = str_replace($directory, "", $file->getPathname());
        $path = str_replace("\\", "/", $path);

        // Exclure dossiers sensibles
        if (str_starts_with($path, "/admin")) continue;
        // Exclure le dossier Game
        if (strpos($path, '/Folder_for_Games') === 0) continue;
        // Exclure le dossier Friends
        if (strpos($path, '/Friends') === 0) continue;
        // Exclure le dossier Image
        if (strpos($path, 'Image') === 0) continue;
        // Exclure le dossier sound
        if (strpos($path, '/Sound') === 0) continue;
        // Exclure le dossier tuto
        if (strpos($path, '/tuto') === 0) continue;
        // Exclure le dossier Friends
        if (strpos($path, '/Friends') === 0) continue;
        //exclure pages precises
        if ($path === '/menu_3D.html') continue;
        if ($path === '/menu.html') continue;





        echo "  <url>\n";
        echo "    <loc>$baseUrl$path</loc>\n";
        echo "    <lastmod>" . date("Y-m-d", $file->getMTime()) . "</lastmod>\n";
        echo "    <priority>0.8</priority>\n";
        echo "  </url>\n";
    }
}


echo "</urlset>";
exit;
