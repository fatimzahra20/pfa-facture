<?php

namespace App\Http\Controllers\Api;

use App\Models\Impot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class ImpotController extends ApiController
{
    public function index(): JsonResponse
    {
        return response()->json(
            Impot::orderBy('date_echeance', 'desc')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'numero' => ['required', 'string', 'max:255', 'unique:impots,numero'],
            'type' => ['required', 'string', 'max:255'],
            'montant' => ['required', 'numeric', 'min:0'],
            'date_echeance' => ['required', 'date'],
            'date_paiement' => ['nullable', 'date'],
            'statut' => ['required', 'in:impayee,payee,partiellement_payee'],
            'description' => ['nullable', 'string'],
            'reference' => ['nullable', 'string', 'max:255'],
            'preuve_paiement_path' => ['nullable', 'string', 'max:255'],
        ]);

        $impot = Impot::create($data);

        return response()->json($impot, 201);
    }

    public function show(Impot $impot): JsonResponse
    {
        return response()->json($impot);
    }

    public function update(Request $request, Impot $impot): JsonResponse
    {
        $data = $request->validate([
            'type' => ['sometimes', 'required', 'string', 'max:255'],
            'montant' => ['sometimes', 'required', 'numeric', 'min:0'],
            'date_echeance' => ['sometimes', 'required', 'date'],
            'date_paiement' => ['nullable', 'date'],
            'statut' => ['sometimes', 'required', 'in:impayee,payee,partiellement_payee'],
            'description' => ['nullable', 'string'],
            'reference' => ['nullable', 'string', 'max:255'],
            'preuve_paiement_path' => ['nullable', 'string', 'max:255'],
        ]);

        if (($data['statut'] ?? null) === 'payee' && ! $impot->preuve_paiement_path) {
            return response()->json([
                'message' => 'Une preuve de paiement est obligatoire pour marquer cet impot comme paye.',
            ], 422);
        }

        $impot->update($data);

        return response()->json($impot);
    }

    public function markAsPaid(Request $request, Impot $impot): JsonResponse
    {
        $data = $request->validate([
            'preuve_paiement' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $file = $data['preuve_paiement'];
        $directory = public_path('uploads/impot-proofs');

        if (! File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        $filename = uniqid('preuve_', true) . '.' . $file->getClientOriginalExtension();
        $file->move($directory, $filename);

        $impot->update([
            'statut' => 'payee',
            'date_paiement' => now()->toDateString(),
            'preuve_paiement_path' => '/uploads/impot-proofs/' . $filename,
        ]);

        return response()->json($impot->fresh());
    }

    public function destroy(Impot $impot): JsonResponse
    {
        $impot->delete();

        return response()->json([
            'message' => 'Impôt supprimé.',
        ]);
    }

    public function getDueImpots(): JsonResponse
    {
        $impots = Impot::where('statut', '!=', 'payee')
            ->where('date_echeance', '<=', now())
            ->orderBy('date_echeance')
            ->get();

        return response()->json($impots);
    }

    public function getByStatut(Request $request): JsonResponse
    {
        $statut = $request->query('statut');
        
        if (!in_array($statut, ['impayee', 'payee', 'partiellement_payee'])) {
            return response()->json(['message' => 'Statut invalide'], 400);
        }

        $impots = Impot::where('statut', $statut)
            ->orderBy('date_echeance', 'desc')
            ->get();

        return response()->json($impots);
    }
}
