<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('impots', function (Blueprint $table) {
            $table->id();
            $table->string('numero')->unique();
            $table->string('type'); // TVA, impôt sur les revenus, etc.
            $table->decimal('montant', 12, 2);
            $table->date('date_echeance');
            $table->date('date_paiement')->nullable();
            $table->enum('statut', ['impayee', 'payee', 'partiellement_payee'])->default('impayee');
            $table->text('description')->nullable();
            $table->string('reference')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('impots');
    }
};
