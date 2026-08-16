# Carnet d'Échange

Application full stack d'échange de manuels scolaires par **tampons**, avec livraison zonée (1 000 F), **Mobile Money** et module **bibliothèque** (emprunt avec caution).

## Stack

| Couche | Technologies |
|--------|-------------|
| Backend | Java 21, Spring Boot 3.4, Spring Security, JWT, JPA, **PostgreSQL** |
| Frontend | React 19, TypeScript, Tailwind CSS 4, Vite |

## Fonctionnalités

- **Inscription / connexion** JWT — 1 tampon de bienvenue offert
- **Dépôt** de manuel avec photo obligatoire (+1 tampon)
- **Mes dépôts** — suivi du statut (disponible, réservé, en livraison, livré)
- **Catalogue** filtrable (niveau, matière, **zone**, **recherche par titre**)
- **Mes commandes** — suivi des réservations et livraisons + **annulation** (remboursement tampon + livraison)
- **Mobile Money** — recharge simulée (Orange Money, MTN, Moov) + débit réel pour livraison et bibliothèque
- **Historique** des transactions (tampons, paiements, recharges)
- **Livraisons par zone** — regroupement automatique, livreur coche « Livré »
- **Bibliothèque** — emprunt / retour avec caution remboursable (5 000 F)
- **Profils** : élève, parent, livreur, bibliothécaire, admin
- **Niveaux** : CP → Terminale

## Démarrage

> Guide détaillé : [DATABASE.md](./DATABASE.md)

### Option rapide (sans Docker) — base persistante H2

```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE="dev"
mvn spring-boot:run
```

Les données sont stockées dans `backend/data/` (conservées après redémarrage).

### Option PostgreSQL (Docker)

```bash
docker compose up -d
cd backend
mvn spring-boot:run
```

Variables d'environnement optionnelles :

| Variable | Défaut |
|----------|--------|
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/carnetechange` |
| `DATABASE_USER` | `carnet` |
| `DATABASE_PASSWORD` | `carnet123` |

### Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173)

## Comptes de démo

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Élève | demo@carnet.fr | demo1234 |
| Élève (déposant) | paul@carnet.fr | demo1234 |
| Parent (déposant) | sophie@carnet.fr | demo1234 |
| Élève (déposant) | karim@carnet.fr | demo1234 |
| Livreur | livreur@carnet.fr | livreur123 |

Au premier démarrage, **17 manuels d'exemple** sont chargés (collège, lycée, primaire + bibliothèque).

Le compte démo a **10 000 F** de solde Mobile Money.

## API principale

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/v1/auth/register` | Inscription |
| POST | `/api/v1/auth/login` | Connexion |
| GET | `/api/v1/auth/me` | Profil courant |
| GET | `/api/v1/books` | Catalogue (filtres level, subject, zoneId, title) |
| GET | `/api/v1/books/mine` | Mes dépôts |
| POST | `/api/v1/books/deposit` | Dépôt avec photo (multipart) |
| GET | `/api/v1/deliveries/orders` | Mes commandes |
| POST | `/api/v1/deliveries/orders/{id}/cancel` | Annuler une réservation |
| POST | `/api/v1/deliveries/reserve/{id}` | Réserver + livraison |
| POST | `/api/v1/deliveries/{id}/delivered` | Marquer livré |
| GET | `/api/v1/wallet` | Solde Mobile Money |
| POST | `/api/v1/wallet/topup` | Recharge Mobile Money |
| GET | `/api/v1/library` | Ouvrages bibliothèque |
| POST | `/api/v1/library/borrow/{id}` | Emprunter |
| POST | `/api/v1/library/return/{id}` | Rendre |
| GET | `/api/v1/transactions` | Historique |

## Configuration

`backend/src/main/resources/application.properties` :

- `app.welcome-stamps=1` — tampons à l'inscription
- `app.delivery-fee=1000` — frais livraison (FCFA)
- `app.library-deposit=5000` — caution bibliothèque (FCFA)

## Déploiement Render

Guide complet : [DEPLOY-RENDER.md](./DEPLOY-RENDER.md)

```bash
# Push sur GitHub → Render → New → Blueprint → render.yaml
```

Services créés : PostgreSQL + API Java + frontend React static.

## Structure

```
carnet-echange/
├── docker-compose.yml   # PostgreSQL
├── backend/             # API Spring Boot
└── frontend/            # Interface React
```
