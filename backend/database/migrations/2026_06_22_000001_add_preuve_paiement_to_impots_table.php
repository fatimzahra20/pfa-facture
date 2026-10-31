<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('impots', function (Blueprint $table) {
            $table->string('preuve_paiement_path')->nullable()->after('reference');
        });
    }

    public function down(): void
    {
        Schema::table('impots', function (Blueprint $table) {
            $table->dropColumn('preuve_paiement_path');
        });
    }
};
