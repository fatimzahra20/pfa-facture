<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CreateProjetsSeeder extends Seeder
{
    public function run(): void
    {
        $projets = [
            [
                'titre' => 'Refonte Site Web',
                'description' => 'Mise à jour complète du site web avec nouveau design',
                'date_debut' => '2026-01-15',
                'date_fin' => '2026-06-30',
                'statut' => 'en_cours',
                'responsable' => 'Mohamed Alaoui',
                'budget' => 50000,
            ],
            [
                'titre' => 'Migration Base de Données',
                'description' => 'Migration des données vers une nouvelle infrastructure',
                'date_debut' => '2026-02-01',
                'date_fin' => '2026-05-15',
                'statut' => 'en_cours',
                'responsable' => 'Fatima Bennani',
                'budget' => 35000,
            ],
            [
                'titre' => 'Système de Facturation v2',
                'description' => 'Développement d\'une nouvelle version du système de facturation',
                'date_debut' => '2026-03-01',
                'date_fin' => '2026-08-31',
                'statut' => 'en_cours',
                'responsable' => 'Hassan Ben Abdelkader',
                'budget' => 75000,
            ],
            [
                'titre' => 'Intégration API Tiers',
                'description' => 'Intégration avec les API de partenaires',
                'date_debut' => '2025-12-01',
                'date_fin' => '2026-04-30',
                'statut' => 'termine',
                'responsable' => 'Aicha Moussaoui',
                'budget' => 25000,
            ],
            [
                'titre' => 'Audit Sécurité',
                'description' => 'Audit de sécurité complet de l\'application',
                'date_debut' => '2026-04-01',
                'date_fin' => '2026-05-31',
                'statut' => 'en_cours',
                'responsable' => 'Karim Bennani',
                'budget' => 40000,
            ],
        ];

        DB::table('projets')->insert($projets);
    }
}
