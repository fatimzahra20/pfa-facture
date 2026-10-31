<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Impot extends Model
{
    use HasFactory;

    protected $table = 'impots';

    protected $fillable = [
        'numero',
        'type',
        'montant',
        'date_echeance',
        'date_paiement',
        'statut',
        'description',
        'reference',
        'preuve_paiement_path',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'date_echeance' => 'date',
        'date_paiement' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function isPaid(): bool
    {
        return $this->statut === 'payee';
    }

    public function isDue(): bool
    {
        return now()->isAfter($this->date_echeance) && !$this->isPaid();
    }

    public function daysUntilDue(): int
    {
        return now()->diffInDays($this->date_echeance);
    }
}
