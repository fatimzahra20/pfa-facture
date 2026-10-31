<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends ApiController
{
    private const ROLES = 'user,comptable,tresorier,admin';

    public function index(): JsonResponse
    {
        return response()->json(
            User::orderBy('nom')->orderBy('name')->get()->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'uid' => $user->id,
                    'nom' => $user->nom ?: $user->name,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'user',
                    'actif' => $user->actif !== false,
                ];
            })
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'in:' . self::ROLES],
            'actif' => ['nullable', 'boolean'],
        ]);

        $user = User::create([
            'name' => $data['nom'],
            'nom' => $data['nom'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'actif' => $data['actif'] ?? true,
        ]);

        return response()->json([
            'id' => $user->id,
            'uid' => $user->id,
            'nom' => $user->nom ?: $user->name,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'actif' => $user->actif !== false,
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json([
            'id' => $user->id,
            'uid' => $user->id,
            'nom' => $user->nom ?: $user->name,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role ?? 'user',
            'actif' => $user->actif !== false,
        ]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'nom' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'role' => ['sometimes', 'required', 'in:' . self::ROLES],
            'actif' => ['nullable', 'boolean'],
        ]);

        if (array_key_exists('nom', $data)) {
            $data['name'] = $data['nom'];
        }

        $user->update($data);

        return response()->json([
            'id' => $user->fresh()->id,
            'uid' => $user->id,
            'nom' => $user->nom ?: $user->name,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role ?? 'user',
            'actif' => $user->actif !== false,
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprime.',
        ]);
    }

    public function updatePassword(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user->update([
            'password' => Hash::make($data['password']),
        ]);

        $user->tokens()->delete();

        return response()->json([
            'message' => 'Mot de passe mis a jour.',
        ]);
    }
}
