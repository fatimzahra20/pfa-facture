<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ApiController extends Controller
{
    protected function notImplemented(string $resource, string $action): JsonResponse
    {
        return response()->json([
            'message' => "Action {$action} a implementer pour {$resource}.",
            'architecture' => 'laravel-mvc',
        ], 501);
    }
}
