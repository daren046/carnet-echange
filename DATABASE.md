# Base de données — Carnet d'Échange

Le projet supporte **deux bases** selon votre environnement.

---

## Option A — Dev rapide (recommandé sans Docker)

**H2 fichier local** — données **persistantes** dans `backend/data/`

```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE="dev"
mvn spring-boot:run
```

| Élément | Valeur |
|---------|--------|
| Type | H2 (fichier) |
| Emplacement | `backend/data/carnetechange.*` |
| Console H2 | http://localhost:8080/h2-console |
| JDBC URL | `jdbc:h2:file:./data/carnetechange` |
| User / Password | `sa` / *(vide)* |

Les livres, comptes et transactions **restent après redémarrage**.

---

## Option B — PostgreSQL avec Docker (production / projet pro)

### 1. Installer [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 2. Lancer la base

```powershell
cd carnet-echange
docker compose up -d
```

### 3. Démarrer le backend (sans profil dev)

```powershell
cd backend
mvn spring-boot:run
```

| Élément | Valeur |
|---------|--------|
| Host | `localhost:5432` |
| Base | `carnetechange` |
| User | `carnet` |
| Password | `carnet123` |

Variables d'environnement optionnelles (voir `.env.example`) :

```
DATABASE_URL=jdbc:postgresql://localhost:5432/carnetechange
DATABASE_USER=carnet
DATABASE_PASSWORD=carnet123
```

---

## Option C — PostgreSQL installé sur Windows (sans Docker)

### 1. Installer PostgreSQL

```powershell
winget install PostgreSQL.PostgreSQL
```

Ou télécharger depuis https://www.postgresql.org/download/windows/

### 2. Créer la base et l'utilisateur

Ouvrir **pgAdmin** ou `psql` :

```sql
CREATE USER carnet WITH PASSWORD 'carnet123';
CREATE DATABASE carnetechange OWNER carnet;
GRANT ALL PRIVILEGES ON DATABASE carnetechange TO carnet;
```

### 3. Lancer le backend

```powershell
cd backend
mvn spring-boot:run
```

Spring Boot crée automatiquement les tables (`ddl-auto=update`).

---

## Schéma (tables créées par JPA)

| Table | Rôle |
|-------|------|
| `users` | Comptes (élèves, parents, livreurs…) |
| `zones` | Quartiers de livraison |
| `book_copies` | Manuels déposés |
| `reservations` | Réservations + livraison |
| `deliveries` | Tournées par zone |
| `transactions` | Tampons, paiements, recharges |
| `library_loans` | Emprunts bibliothèque |

Les données de démo (17 livres, comptes test) sont chargées au **premier démarrage** via `DataLoader.java`.

---

## Quelle option choisir ?

| Situation | Option |
|-----------|--------|
| Développer / tester chez toi, sans installer Docker | **A — H2 fichier** |
| Présenter le projet, démo stable | **A** ou **B** |
| Mise en production réelle | **B** ou **C — PostgreSQL** |
