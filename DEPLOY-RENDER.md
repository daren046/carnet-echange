# Déploiement Render — Carnet d'Échange

## Si l'API est en "Failed deploy"

Sans `DATABASE_URL`, l'API démarre quand même (base H2 temporaire).
Pour Postgres persistant : Render → **Blueprint** → **Sync**.

---

## Déploiement initial

1. [render.com](https://render.com) → **New** → **Blueprint**
2. Repo : `daren046/carnet-echange`
3. **Apply** — plus rien à saisir à la main (tout est dans `render.yaml`)

---

## URLs après déploiement

| Service | URL |
|---------|-----|
| Frontend | https://carnet-echange-web.onrender.com |
| API health | https://carnet-echange-api.onrender.com/api/v1/health |
| Login démo | `demo@carnet.fr` / `demo1234` |

---

## Variables (automatiques via render.yaml)

**API** : `DATABASE_URL`, `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`, `UPLOAD_DIR`

**Frontend** : `VITE_API_URL`

---

## Dépannage rapide

| Problème | Solution |
|----------|----------|
| API Failed deploy | Supprimer `DATABASE_URL` manuelle, Sync Blueprint |
| CORS error | `CORS_ALLOWED_ORIGINS` = URL exacte du frontend |
| Frontend n'appelle pas l'API | Redéployer le frontend (Manual Deploy) |
| API lente au 1er clic | Normal (plan free, cold start ~30 s) |
