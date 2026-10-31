<?php

namespace App\Http\Controllers\Api;

use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArticleController extends ApiController
{
    public function index(): JsonResponse
    {
        return response()->json(Article::orderBy('designation')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'designation' => ['required', 'string', 'max:255'],
            'prix_unitaire' => ['required', 'numeric', 'min:0'],
            'category_id' => ['nullable', 'integer'],
            'tva_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $article = Article::create($data);

        return response()->json($article, 201);
    }

    public function show(Article $article): JsonResponse
    {
        return response()->json($article);
    }

    public function update(Request $request, Article $article): JsonResponse
    {
        $data = $request->validate([
            'designation' => ['sometimes', 'required', 'string', 'max:255'],
            'prix_unitaire' => ['sometimes', 'required', 'numeric', 'min:0'],
            'category_id' => ['nullable', 'integer'],
            'tva_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $article->update($data);

        return response()->json($article->fresh());
    }

    public function destroy(Article $article): JsonResponse
    {
        $article->delete();

        return response()->json([
            'message' => 'Article supprime.',
        ]);
    }
}
