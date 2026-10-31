<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    use HasFactory;

    protected $table = 'factures';

    protected $fillable = [
        'numero',
        'client_id',
        'projet_id',
        'methode_facturation',
        'tva_pct',
        'remise_globale',
        'articles',
        'total_ht',
        'tva',
        'total_ttc',
        'montant_remise',
        'statut',
        'date_creation',
        'date_depot',
        'date_encaissement',
        'type_virement',
        'notes',
        'created_by',
        'validated_by_admin',
        'validated_at',
        'validated_by_uid',
        'digital_signature_enabled',
        'digital_signature_text',
        'send_email_on_validation',
        'client_email_sent_at',
    ];

    protected $casts = [
        'articles' => 'array',
        'validated_by_admin' => 'boolean',
        'digital_signature_enabled' => 'boolean',
        'send_email_on_validation' => 'boolean',
        'date_creation' => 'date',
        'date_depot' => 'date',
        'date_encaissement' => 'date',
        'validated_at' => 'datetime',
        'client_email_sent_at' => 'datetime',
    ];

    public function projet()
    {
        return $this->belongsTo(Projet::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
