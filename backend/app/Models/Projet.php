<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Projet extends Model
{
    protected $fillable = [
        'client_id',
        'titre',
        'description',
        'date_debut',
        'date_fin',
        'statut',
        'responsable',
        'budget',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'budget' => 'integer',
    ];

    public function factures()
    {
        return $this->hasMany(Facture::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function hasFacture()
    {
        return $this->factures()->exists();
    }
}
