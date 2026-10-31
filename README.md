# AFact

Ce dépôt est maintenant organisé autour de deux applications distinctes :

- `backend/` : API Laravel
- `frontend/` : interface React

L'ancien backend Node.js a été supprimé pour laisser Laravel comme backend principal.

## Structure

```text
projet/
├── backend/   # Laravel + SQL Server LocalDB
├── frontend/  # React
├── .gitignore
└── README.md
```

## Backend

Le backend Laravel est situé dans `backend/`.

- Base de données cible : SQL Server LocalDB
- Instance : `(localdb)\MSSQLLocalDB`
- Fichier d'exemple d'environnement : `backend/.env.example`

Démarrage typique :

```bash
cd backend
copy .env.example .env
composer install
php artisan key:generate
php artisan serve
```

Point de contrôle API :

```text
GET /api/v1/health
```

## Frontend

Le frontend React est situé dans `frontend/`.

Démarrage typique :

```bash
cd frontend
npm install
npm start
```

## Remarque

La structure du dépôt est maintenant proprement séparée entre frontend et backend.
La migration complète du frontend depuis Firebase vers l'API Laravel reste à faire dans le code React.
