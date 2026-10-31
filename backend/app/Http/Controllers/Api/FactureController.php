<?php

namespace App\Http\Controllers\Api;

use App\Models\Facture;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class FactureController extends ApiController
{
    public function index(): JsonResponse
    {
        return response()->json(Facture::orderByDesc('created_at')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'numero' => ['required', 'string', 'max:100'],
            'client_id' => ['required', 'integer'],
            'projet_id' => ['nullable', 'integer'],
            'methode_facturation' => ['required', 'string', 'max:100'],
            'tva_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'remise_globale' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'articles' => ['nullable', 'array'],
            'total_ht' => ['nullable', 'numeric', 'min:0'],
            'tva' => ['nullable', 'numeric', 'min:0'],
            'total_ttc' => ['nullable', 'numeric', 'min:0'],
            'montant_remise' => ['nullable', 'numeric', 'min:0'],
            'statut' => ['required', 'string', 'max:50'],
            'date_creation' => ['nullable', 'date'],
            'date_depot' => ['nullable', 'date'],
            'date_encaissement' => ['nullable', 'date'],
            'type_virement' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
            'created_by' => ['nullable', 'integer'],
            'validated_by_admin' => ['nullable', 'boolean'],
            'validated_at' => ['nullable', 'date'],
            'validated_by_uid' => ['nullable', 'integer'],
            'digital_signature_enabled' => ['nullable', 'boolean'],
            'digital_signature_text' => ['nullable', 'string', 'max:255'],
            'send_email_on_validation' => ['nullable', 'boolean'],
            'client_email_sent_at' => ['nullable', 'date'],
        ]);

        $facture = Facture::create($data);

        // If invoice is linked to a project, delete invoice reminders
        if ($facture->projet_id) {
            Notification::where('projet_id', $facture->projet_id)
                ->where('type', 'invoice_reminder')
                ->delete();
        }

        return response()->json($facture, 201);
    }

    public function show(Facture $facture): JsonResponse
    {
        return response()->json($facture);
    }

    public function update(Request $request, Facture $facture): JsonResponse
    {
        $data = $request->validate([
            'numero' => ['sometimes', 'required', 'string', 'max:100'],
            'client_id' => ['sometimes', 'required', 'integer'],
            'projet_id' => ['nullable', 'integer'],
            'methode_facturation' => ['sometimes', 'required', 'string', 'max:100'],
            'tva_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'remise_globale' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'articles' => ['nullable', 'array'],
            'total_ht' => ['nullable', 'numeric', 'min:0'],
            'tva' => ['nullable', 'numeric', 'min:0'],
            'total_ttc' => ['nullable', 'numeric', 'min:0'],
            'montant_remise' => ['nullable', 'numeric', 'min:0'],
            'statut' => ['sometimes', 'required', 'string', 'max:50'],
            'date_creation' => ['nullable', 'date'],
            'date_depot' => ['nullable', 'date'],
            'date_encaissement' => ['nullable', 'date'],
            'type_virement' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
            'created_by' => ['nullable', 'integer'],
            'validated_by_admin' => ['nullable', 'boolean'],
            'validated_at' => ['nullable', 'date'],
            'validated_by_uid' => ['nullable', 'integer'],
            'digital_signature_enabled' => ['nullable', 'boolean'],
            'digital_signature_text' => ['nullable', 'string', 'max:255'],
            'send_email_on_validation' => ['nullable', 'boolean'],
            'client_email_sent_at' => ['nullable', 'date'],
        ]);

        $shouldSendEmail = array_key_exists('validated_by_admin', $data)
            && (bool) $data['validated_by_admin']
            && ! $facture->validated_by_admin;

        // If projet_id is being updated, handle reminders
        if (isset($data['projet_id']) && $data['projet_id'] !== $facture->projet_id) {
            if ($data['projet_id']) {
                // Delete reminders for the new project
                Notification::where('projet_id', $data['projet_id'])
                    ->where('type', 'invoice_reminder')
                    ->delete();
            }
        }

        $facture->update($data);

        if ($shouldSendEmail) {
            $this->sendValidatedInvoiceEmail($facture->fresh());
        }

        return response()->json($facture->fresh());
    }

    public function destroy(Facture $facture): JsonResponse
    {
        $facture->delete();

        return response()->json([
            'message' => 'Facture supprimee.',
        ]);
    }

    private function sendValidatedInvoiceEmail(Facture $facture): void
    {
        $facture->load('client');

        if (! $facture->send_email_on_validation || ! $facture->client?->email) {
            return;
        }

        try {
            Mail::raw(
                "Bonjour {$facture->client->nom},\n\n"
                . "Votre facture {$facture->numero} a ete validee.\n"
                . "Montant total TTC : " . number_format((float) $facture->total_ttc, 2, ',', ' ') . " EUR.\n\n"
                . "Cordialement,\nMaFacture",
                function ($message) use ($facture) {
                    $message
                        ->to($facture->client->email)
                        ->subject("Facture validee - {$facture->numero}");
                }
            );

            $facture->update(['client_email_sent_at' => now()]);
        } catch (Throwable $exception) {
            Log::warning('Invoice validation email could not be sent.', [
                'facture_id' => $facture->id,
                'client_email' => $facture->client->email,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
