<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;

class HealthController extends ApiController
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'backend' => 'laravel',
            'architecture' => 'mvc',
            'database' => 'sqlsrv',
        ]);
    }
}
