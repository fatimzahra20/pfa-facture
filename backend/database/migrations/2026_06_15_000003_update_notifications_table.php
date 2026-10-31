<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->foreignId('impot_id')->nullable()->constrained('impots')->onDelete('cascade')->after('projet_id');
            $table->foreignId('from_user_id')->nullable()->constrained('users')->onDelete('cascade')->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeignKeyIfExists('notifications_impot_id_foreign');
            $table->dropColumn('impot_id');
            $table->dropForeignKeyIfExists('notifications_from_user_id_foreign');
            $table->dropColumn('from_user_id');
        });
    }
};
