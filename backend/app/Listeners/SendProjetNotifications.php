<?php

namespace App\Listeners;

use App\Events\ProjetCreated;
use App\Models\Notification;
use App\Models\User;

class SendProjetNotifications
{
    public function handle(ProjetCreated $event): void
    {
        $projet = $event->projet;

        // Create notifications for all active comptables
        $comptables = User::where('role', 'comptable')->where('actif', true)->get();

        foreach ($comptables as $comptable) {
            Notification::create([
                'user_id' => $comptable->id,
                'projet_id' => $projet->id,
                'type' => 'projet_created',
                'titre' => "Nouveau projet: {$projet->titre}",
                'description' => $projet->description,
                'data' => [
                    'projet_id' => $projet->id,
                    'titre' => $projet->titre,
                    'description' => $projet->description,
                    'date_debut' => $projet->date_debut,
                    'date_fin' => $projet->date_fin,
                    'responsable' => $projet->responsable,
                    'budget' => $projet->budget,
                    'action_required' => 'add_invoice',
                ],
            ]);
        }
    }
}
