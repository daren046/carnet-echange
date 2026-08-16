# Déploiement sur Render

Guide pas à pas pour mettre **Carnet d'Échange** en ligne gratuitement.

---

## Prérequis

1. Compte [Render](https://render.com) (gratuit)
2. Projet poussé sur **GitHub** ou **GitLab**

---

## Méthode 1 — Blueprint (recommandée)

Le fichier `render.yaml` à la racine crée automatiquement :
- **PostgreSQL** (`carnet-db`)
- **API** Spring Boot (`carnet-echange-api`)
- **Frontend** React (`carnet-echange-web`)

### Étapes

1. Push le code sur GitHub
2. Render → **New** → **Blueprint**
3. Connecter le dépôt → Render détecte `render.yaml`
4. **Avant de déployer**, renseigner les variables manuelles :

| Service | Variable | Valeur |
|---------|----------|--------|
| **API** | `JWT_SECRET` | Secret Base64 (256 bits) — `openssl rand -base64 32` |
| **API** | `CORS_ALLOWED_ORIGINS` | URL du frontend Render (ex. `https://carnet-echange-web.onrender.com`) |
| **Web** | `VITE_API_URL` | URL de l'API (ex. `https://carnet-echange-api.onrender.com/api/v1`) |

5. Cliquer **Apply** → attendre le déploiement (~5-10 min)

6. **Redéployer le frontend** une fois l'URL de l'API connue (variable `VITE_API_URL` utilisée au build)

---

## Méthode 2 — Manuelle

### A. Base PostgreSQL

1. Render → **New** → **PostgreSQL**
2. Name : `carnet-db`, Plan : **Free**
3. Noter l'**Internal Database URL**

### B. Backend (Web Service)

| Champ | Valeur |
|-------|--------|
| Runtime | **Docker** |
| Root Directory | `backend` |
| Dockerfile | `backend/Dockerfile` |
| Health Check | `/api/v1/health` |

**Variables d'environnement :**

```
DATABASE_URL=<Internal Database URL from PostgreSQL>
JWT_SECRET=<openssl rand -base64 32>
CORS_ALLOWED_ORIGINS=https://votre-frontend.onrender.com
UPLOAD_DIR=/tmp/carnet-uploads
```

Lier la base PostgreSQL au service (Render injecte `DATABASE_URL`).

### C. Frontend (Static Site)

| Champ | Valeur |
|-------|--------|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

**Variable :**

```
VITE_API_URL=https://votre-api.onrender.com/api/v1
```

**Rewrite rule** (SPA React Router) :
- Render → Settings → Redirects/Rewrites
- Source : `/*` → Destination : `/index.html` (Rewrite)

---

## Vérification

| Test | URL |
|------|-----|
| API health | `https://carnet-echange-api.onrender.com/api/v1/health` |
| Frontend | `https://carnet-echange-web.onrender.com` |
| Login démo | `demo@carnet.fr` / `demo1234` |

---

## Limitations plan gratuit Render

| Point | Détail |
|-------|--------|
| **Cold start** | L'API s'endort après 15 min d'inactivité (~30 s au réveil) |
| **Photos uploadées** | Stockées en `/tmp` — **perdues au redéploiement** |
| **Livres démo** | Photos Unsplash → OK |
| **PostgreSQL free** | Expire après 90 jours (backup avant) |

Pour les photos en production : brancher **Cloudinary** ou **AWS S3** (évolution future).

---

## Dépannage

**CORS error dans le navigateur**
→ Vérifier `CORS_ALLOWED_ORIGINS` = URL exacte du frontend (sans `/` final)

**Frontend n'appelle pas l'API**
→ Vérifier `VITE_API_URL` et **redéployer** le frontend (variable lue au build)

**Base de données connection refused**
→ Utiliser l'**Internal Database URL**, pas l'External

**Build Docker échoue**
→ Vérifier les logs Render ; le `Dockerfile` dans `backend/` utilise Java 21

---

## Commandes utiles

Générer un JWT secret :
```bash
openssl rand -base64 32
```

Tester l'API en local avec PostgreSQL Render (External URL) :
```powershell
$env:DATABASE_URL="postgresql://..."
$env:JWT_SECRET="votre-secret-base64"
mvn spring-boot:run
```
