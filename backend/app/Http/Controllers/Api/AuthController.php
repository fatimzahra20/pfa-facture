<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;

class AuthController extends Controller
{
    public function login(Request $request): \Illuminate\Http\JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Identifiants invalides.',
            ], 422);
        }

        if ($user->actif === false) {
            return response()->json([
                'message' => 'Ce compte est desactive.',
            ], 403);
        }

        $token = $user->createToken('frontend')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'uid' => $user->id,
                'nom' => $user->nom ?: $user->name,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'user',
                'actif' => $user->actif !== false,
            ],
        ]);
    }

    public function logout(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Deconnexion reussie.',
        ]);
    }

    public function me(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();

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
}
