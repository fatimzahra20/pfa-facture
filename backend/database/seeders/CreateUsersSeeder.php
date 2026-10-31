<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class CreateUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Admin user
        DB::table('users')->insert([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('admin123'),
            'nom' => 'Administrateur',
            'role' => 'admin',
            'actif' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Comptable user
        DB::table('users')->insert([
            'name' => 'Comptable',
            'email' => 'comptable@example.com',
            'password' => Hash::make('comptable123'),
            'nom' => 'Utilisateur Comptable',
            'role' => 'comptable',
            'actif' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // User regular
        DB::table('users')->insert([
            'name' => 'User',
            'email' => 'user@example.com',
            'password' => Hash::make('user123'),
            'nom' => 'Utilisateur Standard',
            'role' => 'user',
            'actif' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Tresorier user
        DB::table('users')->insert([
            'name' => 'Tresorier',
            'email' => 'tresorier@example.com',
            'password' => Hash::make('tresorier123'),
            'nom' => 'Gestionnaire Trésorier',
            'role' => 'tresorier',
            'actif' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
