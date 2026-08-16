# Déploiement Render — Carnet d'Échange

## Si l'API est en "Failed deploy"

1. Render → **carnet-echange-api** → **Environment**
2. **Supprime** ces variables si présentes (elles bloquent le bon fonctionnement) :
   - `DATABASE_URL` (surtout si ce n'est pas une URL `postgresql://...`)
   - `VITE_API_URL` (ne va que sur le frontend)
3. Render → ton **Blueprint** → **Sync** (réapplique `render.yaml`)
4. Attends 5–10 min le redéploiement

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

**API** : `RENDER_DATABASE_URL`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`, `UPLOAD_DIR`

**Frontend** : `VITE_API_URL`

---

## Dépannage rapide

| Problème | Solution |
|----------|----------|
| API Failed deploy | Supprimer `DATABASE_URL` manuelle, Sync Blueprint |
| CORS error | `CORS_ALLOWED_ORIGINS` = URL exacte du frontend |
| Frontend n'appelle pas l'API | Redéployer le frontend (Manual Deploy) |
| API lente au 1er clic | Normal (plan free, cold start ~30 s) |
