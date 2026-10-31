<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\Projet;
use App\Models\User;
use Illuminate\Console\Command;

class CreateInvoiceReminders extends Command
{
    protected $signature = 'invoices:create-reminders {--force : Force creation of reminders even if they exist}';
    protected $description = 'Create invoice reminders for all projects without invoices';

    public function handle()
    {
        $this->info('Creating invoice reminders...');

        $projets = Projet::with('factures')
            ->get()
            ->filter(fn($projet) => !$projet->hasFacture());

        if ($projets->isEmpty()) {
            $this->info('No projects without invoices found.');
            return 0;
        }

        $comptables = User::where('role', 'comptable')->where('actif', true)->get();

        if ($comptables->isEmpty()) {
            $this->warn('No active accountants found.');
            return 1;
        }

        $remindersCreated = 0;

        foreach ($projets as $projet) {
            foreach ($comptables as $comptable) {
                // Check if a reminder already exists
                $existingNotification = Notification::where('user_id', $comptable->id)
                    ->where('projet_id', $projet->id)
                    ->where('type', 'invoice_reminder')
                    ->when(!$this->option('force'), fn($q) => $q->whereNull('read_at'))
                    ->first();

                if (!$existingNotification || $this->option('force')) {
                    Notification::create([
                        'user_id' => $comptable->id,
                        'projet_id' => $projet->id,
                        'type' => 'invoice_reminder',
                        'titre' => "Rappel: Facture manquante pour {$projet->titre}",
                        'description' => "Le projet {$projet->titre} n'a pas de facture associée. Veuillez en créer une.",
                        'data' => [
                            'projet_id' => $projet->id,
                            'titre' => $projet->titre,
                            'action_required' => 'add_invoice',
                        ],
                    ]);
                    $remindersCreated++;
                }
            }
        }

        $this->info("✓ Reminders created successfully: {$remindersCreated}");
        $this->info("Projects without invoices: " . count($projets));

        return 0;
    }
}
