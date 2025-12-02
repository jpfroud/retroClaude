# Guide de Déploiement - RetroClaudeApp

Ce guide explique comment déployer automatiquement l'application sur Railway depuis GitHub.

## 🚀 Option 1 : Déploiement sur Railway (Recommandé)

Railway est une plateforme qui permet de déployer facilement des applications full-stack avec base de données PostgreSQL incluse.

### Étape 1 : Préparer le Repository GitHub

Votre code est déjà sur GitHub sur la branche `claude/teamretro-app-clone-01RsZA515NVtWY2KALXtJdDD`.

**Option A : Merger vers main (recommandé pour production)**
```bash
git checkout main
git merge claude/teamretro-app-clone-01RsZA515NVtWY2KALXtJdDD
git push origin main
```

**Option B : Déployer depuis la branche actuelle**
Vous pouvez déployer directement depuis votre branche de feature.

### Étape 2 : Créer un Compte Railway

1. Allez sur **https://railway.app**
2. Cliquez sur **"Login"** et connectez-vous avec **GitHub**
3. Autorisez Railway à accéder à vos repositories

### Étape 3 : Créer un Nouveau Projet

1. Dans Railway, cliquez sur **"New Project"**
2. Sélectionnez **"Deploy from GitHub repo"**
3. Choisissez le repository **`jpfroud/retroClaude`**
4. Sélectionnez la branche à déployer (main ou votre branche)

### Étape 4 : Configurer la Base de Données PostgreSQL

1. Dans votre projet Railway, cliquez sur **"+ New"**
2. Sélectionnez **"Database"** → **"Add PostgreSQL"**
3. Railway va créer automatiquement une base de données PostgreSQL
4. Notez que la variable `DATABASE_URL` sera automatiquement ajoutée

### Étape 5 : Configurer le Backend

1. Railway devrait détecter automatiquement le dossier `backend/`
2. Si ce n'est pas le cas, cliquez sur le service backend → **Settings**
3. Dans **"Root Directory"**, entrez : `backend`
4. Dans **"Build Command"**, entrez : `npm install && npx prisma generate && npm run build`
5. Dans **"Start Command"**, entrez : `sh -c "npx prisma migrate deploy && node dist/index.js"`

**Ajouter les Variables d'Environnement :**

Allez dans **Variables** et ajoutez :
```
NODE_ENV=production
PORT=3001
JWT_SECRET=votre-secret-jwt-super-securise-a-changer
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://votre-frontend-url.railway.app
```

**Note :** Railway fournira automatiquement `DATABASE_URL` depuis la base PostgreSQL créée.

### Étape 6 : Configurer le Frontend

1. Cliquez sur **"+ New"** → **"GitHub Repo"** (même repo)
2. Dans **Settings** :
   - **Root Directory** : `frontend`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : Laissez vide (Nginx s'occupera du démarrage)

**Ajouter les Variables d'Environnement :**

Dans **Variables**, ajoutez :
```
VITE_API_URL=https://votre-backend-url.railway.app
```

**Remplacez** `votre-backend-url.railway.app` par l'URL publique de votre service backend (visible dans Railway).

### Étape 7 : Déployer !

1. Railway va automatiquement déployer les deux services
2. Attendez que les builds se terminent (2-5 minutes)
3. Cliquez sur chaque service pour voir les URLs publiques

### Étape 8 : Tester l'Application

1. Ouvrez l'URL du **frontend** dans votre navigateur
2. Créez une rétrospective
3. Testez avec plusieurs onglets/navigateurs

---

## 🔄 Déploiement Automatique

Railway redéploie automatiquement à chaque push sur GitHub !

```bash
# Faites vos modifications
git add .
git commit -m "fix: correction bug"
git push

# Railway va automatiquement redéployer 🚀
```

---

## 🌐 Option 2 : Déploiement sur Vercel (Frontend) + Railway (Backend)

### Frontend sur Vercel

1. Allez sur **https://vercel.com**
2. Connectez-vous avec GitHub
3. Cliquez sur **"New Project"**
4. Importez `jpfroud/retroClaude`
5. **Root Directory** : `frontend`
6. **Framework Preset** : Vite
7. **Build Command** : `npm run build`
8. **Output Directory** : `dist`

**Variables d'environnement :**
```
VITE_API_URL=https://votre-backend.railway.app
```

9. Cliquez **"Deploy"**

### Backend sur Railway

Suivez les étapes 4-5 de l'Option 1.

---

## 🐳 Option 3 : Déploiement Docker sur VPS

Si vous avez un serveur VPS (DigitalOcean, Linode, AWS EC2, etc.) :

### 1. Créer un fichier docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: retroclaudeapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/retroclaudeapp
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3001
      NODE_ENV: production
      FRONTEND_URL: ${FRONTEND_URL}
    ports:
      - "3001:3001"
    depends_on:
      - postgres

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 2. Créer un fichier .env

```bash
POSTGRES_PASSWORD=super_secure_password
JWT_SECRET=super_secure_jwt_secret
FRONTEND_URL=http://votre-domaine.com
```

### 3. Déployer

```bash
# Sur votre serveur
git clone https://github.com/jpfroud/retroClaude.git
cd retroClaude
cp .env.example .env
nano .env  # Configurez vos variables

# Lancer avec Docker Compose
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

---

## 📊 Vérification du Déploiement

### Backend
Testez l'endpoint health :
```bash
curl https://votre-backend.railway.app/api/health
```

Devrait retourner :
```json
{"status":"ok","timestamp":"2024-..."}
```

### Frontend
Ouvrez l'URL dans un navigateur, vous devriez voir la page d'accueil.

### WebSocket
Le WebSocket devrait se connecter automatiquement. Vérifiez dans la console du navigateur :
```
Socket connected
```

---

## 🔧 Résolution de Problèmes

### Le backend ne démarre pas

**Problème :** Erreur de connexion à la base de données

**Solution :**
1. Vérifiez que PostgreSQL est bien provisionné
2. Vérifiez que `DATABASE_URL` est correctement configurée
3. Dans Railway, allez dans **Variables** et vérifiez la connexion

### Le frontend ne se connecte pas au backend

**Problème :** CORS error

**Solution :**
1. Vérifiez que `FRONTEND_URL` dans le backend pointe vers l'URL correcte du frontend
2. Vérifiez que `VITE_API_URL` dans le frontend pointe vers le backend

### Les migrations Prisma échouent

**Solution :**
```bash
# Connectez-vous au service backend dans Railway
# Onglet "Deployments" → cliquez sur le dernier déploiement → "View Logs"

# Si vous voyez des erreurs Prisma, réinitialisez la base :
# Dans le service backend, ajoutez une variable :
RESET_DB=true

# Puis redéployez
```

### WebSocket ne fonctionne pas

**Problème :** WebSocket connection failed

**Solution :**
1. Vérifiez que votre hébergeur supporte WebSocket (Railway : OUI)
2. Vérifiez que le port WebSocket est bien exposé
3. Dans le backend, vérifiez que Socket.io utilise le bon CORS origin

---

## 🎉 Déploiement Réussi !

Votre application est maintenant accessible publiquement :

- **Frontend** : https://votre-frontend.railway.app
- **Backend API** : https://votre-backend.railway.app
- **Base de données** : Hébergée automatiquement

Partagez l'URL avec votre équipe et profitez de vos rétrospectives ! 🚀

---

## 📈 Monitoring

### Railway Dashboard
- Consultez les métriques en temps réel
- CPU, RAM, Requêtes/sec
- Logs en direct

### Logs Backend
```bash
# Dans Railway, onglet "Deployments"
# Cliquez sur le service → "View Logs"
```

### Logs Frontend
```bash
# Dans votre navigateur
# F12 → Console
```

---

## 💰 Coûts

**Railway** :
- **Plan Hobby** : $5/mois (500 heures d'exécution)
- Inclut : PostgreSQL, déploiements illimités, SSL automatique
- Parfait pour des équipes de 5-20 personnes

**Vercel** :
- **Plan Hobby** : Gratuit
- Déploiements illimités
- Parfait pour le frontend statique

---

## 🔒 Sécurité

Avant la production :

1. ✅ Changez `JWT_SECRET` pour une valeur aléatoire sécurisée
2. ✅ Utilisez des mots de passe forts pour PostgreSQL
3. ✅ Activez HTTPS (automatique sur Railway/Vercel)
4. ✅ Configurez les CORS correctement
5. ✅ Surveillez les logs pour détecter les anomalies

---

## 📞 Support

- **Railway** : https://railway.app/help
- **Vercel** : https://vercel.com/support
- **Documentation** : Voir INSTALLATION.md et GUIDE_UTILISATEUR.md
