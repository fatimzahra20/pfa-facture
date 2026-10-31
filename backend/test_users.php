<?php
require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$client = \App\Models\Client::first();
if ($client) {
    echo "Premier client ID: {$client->id}\n";
    echo "Nom: {$client->nom}\n";
} else {
    echo "Aucun client trouvé\n";
}
