<?php

use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\FactureController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProjetController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ImpotController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', HealthController::class);

    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        Route::apiResource('articles', ArticleController::class);
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('clients', ClientController::class);
        Route::apiResource('factures', FactureController::class);
        Route::apiResource('projets', ProjetController::class);
        Route::apiResource('users', UserController::class);
        Route::get('impots/due', [ImpotController::class, 'getDueImpots']);
        Route::get('impots/by-statut', [ImpotController::class, 'getByStatut']);
        Route::post('impots/{impot}/mark-paid', [ImpotController::class, 'markAsPaid']);
        Route::apiResource('impots', ImpotController::class);
        Route::put('users/{user}/password', [UserController::class, 'updatePassword']);

        // Projects without invoices
        Route::get('projets/without-invoices', [ProjetController::class, 'projectsWithoutInvoices']);
        Route::post('projets/create-invoice-reminders', [ProjetController::class, 'createInvoiceReminders']);

        // Notification routes
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/send', [NotificationController::class, 'send']);
        Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    });
});
