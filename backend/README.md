# Backend Laravel

Ce dossier contient le backend principal du projet.

## Architecture

Le backend suit maintenant une organisation Laravel MVC :

- `app/Models/` pour les entites metier
- `app/Http/Controllers/Api/` pour les controleurs API
- `routes/api.php` pour les routes REST
- `database/` pour les migrations et les seeders

## Base de données

Le projet est configuré pour utiliser SQL Server LocalDB :

- Instance : `(localdb)\MSSQLLocalDB`
- Connexion Laravel : `sqlsrv`
- Base par défaut : `afact`

Le modèle d'environnement est disponible dans `backend/.env.example`.

## Installation

```bash
copy .env.example .env
composer install
php artisan key:generate
php artisan serve
```

## Vérification rapide

Une route de contrôle est disponible :

```text
GET /api/v1/health
```
