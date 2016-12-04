<?php

//get the requested URL (in local directory format) and show the listing
$dir = $_SERVER["DOCUMENT_ROOT"] . $_SERVER["REQUEST_URI"];
print_dir_listing($dir);

//shows a listing for the local directory $dir
function print_dir_listing($dir) {
    $files = scandir($dir);
    $hidden = array(".", ".htaccess", "index.php");
    $files = array_diff($files, $hidden);
    foreach ($files as $file) {
        $file_exp = explode(".", $file);
        $file_type = $file_exp[count($file_exp)-1];
        if ($file_type  == "mp3") {
            echo("<audio controls><source src=\"" . $file . "\" type=\"audio/mpeg\"></audio> (" . $file . ")<br />");
        } else {
            echo("<a href=\"" . $file . "\">" . $file . "</a><br />");
        }
    }
}
