<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@facturepro.fr'],
            [
                'name' => 'Administrateur General',
                'nom' => 'Administrateur General',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'actif' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'user@facturepro.fr'],
            [
                'name' => 'Comptable Test',
                'nom' => 'Comptable Test',
                'password' => Hash::make('user123'),
                'role' => 'user',
                'actif' => true,
            ]
        );
    }
}
