# Fonctionnalité: Notifications de Factures Manquantes

## Description

Cette fonctionnalité garantit que pour chaque projet créé par un administrateur, le comptable reçoit une notification pour créer une facture associée au projet. Si le comptable ne crée pas de facture, il reçoit des rappels périodiques.

## Workflow

### 1. Création d'un Projet

Quand un administrateur crée un nouveau projet via `POST /v1/projets`:

- Le système déclenche automatiquement un événement `ProjetCreated`
- Le listener `SendProjetNotifications` crée une notification pour chaque comptable actif
- La notification indique que le comptable doit créer une facture pour ce projet

### 2. Suivi des Projets sans Facture

Le système suit automatiquement les projets sans facture associée:

- **Route**: `GET /v1/projets/without-invoices` - Liste tous les projets sans facture
- **Route**: `POST /v1/projets/create-invoice-reminders` - Crée des rappels pour les comptables

### 3. Commande Artisan

Une commande CLI est disponible pour générer les rappels:

```bash
php artisan invoices:create-reminders
php artisan invoices:create-reminders --force  # Force la création même si des rappels existent
```

### 4. Création d'une Facture

Quand un comptable crée une facture via `POST /v1/factures` avec un `projet_id`:

- La facture est associée au projet
- Toutes les notifications de rappel pour ce projet sont automatiquement supprimées
- Le comptable reçoit une notification de confirmation

## Structure de Données

### Modèle Facture

- Nouvelles colonnes: `projet_id` (foreign key vers la table `projets`)
- Relations:
    - `projet()` - Relation avec le modèle Projet
    - `client()` - Relation avec le modèle Client

### Modèle Projet

- Nouvelles relations:
    - `factures()` - Retourne toutes les factures du projet
    - `notifications()` - Retourne toutes les notifications du projet
    - `hasFacture()` - Méthode pour vérifier si le projet a une facture

### Modèle Notification

- Nouveau type: `invoice_reminder` - Pour les rappels de factures manquantes
- Types existants: `projet_created` - Quand un projet est créé

## API Endpoints

### Projets

```
GET    /v1/projets                              - Liste tous les projets avec leurs factures
POST   /v1/projets                              - Créer un projet (envoie notifications)
GET    /v1/projets/{id}                         - Afficher un projet avec ses factures
PUT    /v1/projets/{id}                         - Modifier un projet
DELETE /v1/projets/{id}                         - Supprimer un projet
GET    /v1/projets/without-invoices             - Lister les projets sans facture
POST   /v1/projets/create-invoice-reminders     - Créer les rappels de factures manquantes
```

### Factures

```
GET    /v1/factures                             - Liste toutes les factures
POST   /v1/factures                             - Créer une facture (supprime les rappels si projet_id fourni)
GET    /v1/factures/{id}                        - Afficher une facture
PUT    /v1/factures/{id}                        - Modifier une facture
DELETE /v1/factures/{id}                        - Supprimer une facture
```

## Fichiers Créés/Modifiés

### Fichiers Créés

- `app/Events/ProjetCreated.php` - Événement déclenché quand un projet est créé
- `app/Listeners/SendProjetNotifications.php` - Listener pour créer les notifications
- `app/Console/Commands/CreateInvoiceReminders.php` - Commande Artisan pour les rappels
- `database/migrations/2026_05_28_000000_add_projet_id_to_factures_table.php` - Migration pour ajouter projet_id

### Fichiers Modifiés

- `app/Models/Projet.php` - Ajout des relations et de la méthode `hasFacture()`
- `app/Models/Facture.php` - Ajout de `projet_id` et des relations
- `app/Providers/EventServiceProvider.php` - Enregistrement de l'événement et du listener
- `app/Http/Controllers/Api/ProjetController.php` - Utilisation de l'événement et ajout des nouvelles routes
- `app/Http/Controllers/Api/FactureController.php` - Gestion de `projet_id` et suppression des rappels
- `routes/api.php` - Ajout des nouvelles routes

## Exemple d'Utilisation

### 1. Admin crée un projet

```json
POST /v1/projets
{
  "titre": "Nouveau Projet Web",
  "description": "Développement d'un site web",
  "date_debut": "2026-06-01",
  "date_fin": "2026-08-31",
  "statut": "en_cours",
  "responsable": "Jean Dupont",
  "budget": 50000
}
```

→ Les comptables reçoivent une notification pour créer une facture

### 2. Lister les projets sans facture

```
GET /v1/projets/without-invoices
```

### 3. Comptable crée une facture pour le projet

```json
POST /v1/factures
{
  "numero": "FAC-2026-001",
  "client_id": 1,
  "projet_id": 5,
  "methode_facturation": "ht_tva",
  "total_ht": 50000,
  "tva": 10000,
  "total_ttc": 60000,
  "statut": "en_attente",
  "created_by": 3
}
```

→ La notification de rappel est automatiquement supprimée

### 4. Générer les rappels (scheduler ou manuel)

```bash
php artisan invoices:create-reminders
```

## Notifications

Les comptables peuvent consulter leurs notifications via:

```
GET /v1/notifications                           - Lister toutes les notifications
PUT /v1/notifications/{id}/read                 - Marquer comme lue
PUT /v1/notifications/read-all                  - Marquer toutes comme lues
DELETE /v1/notifications/{id}                   - Supprimer une notification
```

## Intégration Scheduler (Optionnel)

Pour envoyer des rappels automatiques tous les jours à 9h du matin, ajouter dans `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    $schedule->command('invoices:create-reminders')->dailyAt('09:00');
}
```
