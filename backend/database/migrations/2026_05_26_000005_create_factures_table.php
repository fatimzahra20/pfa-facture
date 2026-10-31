<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('factures', function (Blueprint $table) {
            $table->id();
            $table->string('numero')->unique();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->string('methode_facturation')->default('ht_tva');
            $table->decimal('tva_pct', 5, 2)->default(20);
            $table->decimal('remise_globale', 5, 2)->default(0);
            $table->longText('articles')->nullable();
            $table->decimal('total_ht', 12, 2)->default(0);
            $table->decimal('tva', 12, 2)->default(0);
            $table->decimal('total_ttc', 12, 2)->default(0);
            $table->decimal('montant_remise', 12, 2)->default(0);
            $table->string('statut')->default('en_attente');
            $table->date('date_creation')->nullable();
            $table->date('date_depot')->nullable();
            $table->date('date_encaissement')->nullable();
            $table->string('type_virement')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->boolean('validated_by_admin')->default(false);
            $table->timestamp('validated_at')->nullable();
            $table->unsignedBigInteger('validated_by_uid')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('factures');
    }
};
