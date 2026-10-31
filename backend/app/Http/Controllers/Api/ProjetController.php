<?php

namespace App\Http\Controllers\Api;

use App\Events\ProjetCreated;
use App\Models\Notification;
use App\Models\Projet;
use App\Models\User;
use Illuminate\Http\Request;

class ProjetController extends ApiController
{
    public function index()
    {
        $projets = Projet::with(['client', 'factures', 'notifications'])->orderBy('date_debut', 'desc')->get();
        
        return response()->json($projets);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'client_id' => ['nullable', 'integer', 'exists:clients,id'],
            'description' => ['nullable', 'string'],
            'date_debut' => ['required', 'date'],
            'date_fin' => ['required', 'date'],
            'statut' => ['required', 'in:en_cours,termine,suspendu'],
            'responsable' => ['nullable', 'string'],
            'budget' => ['nullable', 'integer'],
        ]);

        $projet = Projet::create($validated);

        // Dispatch event to notify comptables
        ProjetCreated::dispatch($projet);

        return response()->json($projet, 201);
    }

    public function show(Projet $projet)
    {
        $projet->load(['client', 'factures', 'notifications']);
        return response()->json($projet);
    }

    public function update(Request $request, Projet $projet)
    {
        $validated = $request->validate([
            'titre' => ['sometimes', 'string', 'max:255'],
            'client_id' => ['nullable', 'integer', 'exists:clients,id'],
            'description' => ['nullable', 'string'],
            'date_debut' => ['sometimes', 'date'],
            'date_fin' => ['sometimes', 'date'],
            'statut' => ['sometimes', 'in:en_cours,termine,suspendu'],
            'responsable' => ['nullable', 'string'],
            'budget' => ['nullable', 'integer'],
        ]);

        $projet->update($validated);
        return response()->json($projet);
    }

    public function destroy(Projet $projet)
    {
        // Delete related notifications
        $projet->notifications()->delete();
        $projet->delete();
        return response()->json(null, 204);
    }

    /**
     * Get projects without invoices
     */
    public function projectsWithoutInvoices()
    {
        $projets = Projet::with('factures')
            ->get()
            ->filter(fn($projet) => !$projet->hasFacture());

        return response()->json($projets);
    }

    /**
     * Create a reminder notification for projects without invoices
     */
    public function createInvoiceReminders()
    {
        $projets = Projet::with('factures')
            ->get()
            ->filter(fn($projet) => !$projet->hasFacture());

        $comptables = User::where('role', 'comptable')->where('actif', true)->get();

        foreach ($projets as $projet) {
            foreach ($comptables as $comptable) {
                // Check if a reminder already exists
                $existingNotification = Notification::where('user_id', $comptable->id)
                    ->where('projet_id', $projet->id)
                    ->where('type', 'invoice_reminder')
                    ->whereNull('read_at')
                    ->first();

                if (!$existingNotification) {
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
                }
            }
        }

        return response()->json([
            'message' => 'Reminders created successfully',
            'projects_without_invoices' => count($projets),
        ]);
    }
}
