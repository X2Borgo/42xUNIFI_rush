<?php
$db = new SQLite3('mydatabase.sqlite');

if (!$db) {
    die("Error: Could not create/open database.");
} else {
    echo "Database ready!";
}
?>