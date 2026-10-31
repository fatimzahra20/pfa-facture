<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('factures', function (Blueprint $table) {
            $table->boolean('digital_signature_enabled')->default(false)->after('validated_by_uid');
            $table->string('digital_signature_text')->nullable()->after('digital_signature_enabled');
            $table->boolean('send_email_on_validation')->default(false)->after('digital_signature_text');
            $table->timestamp('client_email_sent_at')->nullable()->after('send_email_on_validation');
        });
    }

    public function down(): void
    {
        Schema::table('factures', function (Blueprint $table) {
            $table->dropColumn([
                'digital_signature_enabled',
                'digital_signature_text',
                'send_email_on_validation',
                'client_email_sent_at',
            ]);
        });
    }
};
