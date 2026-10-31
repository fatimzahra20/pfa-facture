<?php

namespace App\Events;

use App\Models\Projet;
use Illuminate\Broadcasting\Channel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProjetCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public Projet $projet)
    {
    }
}
