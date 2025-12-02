# Guide d'Installation - RetroClaudeApp

Ce guide explique comment installer et démarrer l'application RetroClaudeApp.

## Prérequis

- **Node.js** 18+ ([télécharger](https://nodejs.org/))
- **PostgreSQL** 14+ ([télécharger](https://www.postgresql.org/download/))
- **npm** ou **yarn**

## Installation

### 1. Cloner le repository

```bash
git clone <repository-url>
cd retroClaude
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer la base de données PostgreSQL

Créez une base de données PostgreSQL :

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE retroclaudeapp;

# Quitter
\q
```

### 4. Configurer le backend

```bash
cd backend

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos configurations
# Notamment DATABASE_URL avec vos informations PostgreSQL
nano .env
```

Exemple de `.env` :

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/retroclaudeapp"
PORT=3001
NODE_ENV=development
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
```

### 5. Initialiser Prisma et la base de données

```bash
# Toujours dans le dossier backend
npm run prisma:generate
npm run prisma:migrate
```

### 6. Configurer le frontend

```bash
cd ../frontend

# Copier le fichier d'environnement
cp .env.example .env

# Le fichier devrait contenir :
# VITE_API_URL=http://localhost:3001
```

## Démarrage

### Option 1 : Démarrer tout en une commande (depuis la racine)

```bash
npm run dev
```

Cette commande démarre à la fois le backend et le frontend.

### Option 2 : Démarrer séparément

**Terminal 1 - Backend :**

```bash
cd backend
npm run dev
```

Le backend démarre sur **http://localhost:3001**

**Terminal 2 - Frontend :**

```bash
cd frontend
npm run dev
```

Le frontend démarre sur **http://localhost:5173**

## Vérification

1. Ouvrez votre navigateur à l'adresse **http://localhost:5173**
2. Vous devriez voir la page d'accueil de RetroClaudeApp
3. Cliquez sur "Créer une rétrospective" pour commencer

## Commandes utiles

### Backend

```bash
# Démarrer en mode développement
npm run dev

# Build pour production
npm run build

# Démarrer en production
npm start

# Prisma Studio (interface graphique pour la base de données)
npm run prisma:studio

# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration
```

### Frontend

```bash
# Démarrer en mode développement
npm run dev

# Build pour production
npm run build

# Prévisualiser le build de production
npm run preview

# Lint
npm run lint
```

## Résolution de problèmes

### Erreur de connexion à la base de données

Vérifiez que :
- PostgreSQL est démarré
- Les informations de connexion dans `backend/.env` sont correctes
- La base de données `retroclaudeapp` existe

### Erreur "Module not found"

Réinstallez les dépendances :

```bash
# Depuis la racine
rm -rf node_modules package-lock.json
cd backend && rm -rf node_modules package-lock.json
cd ../frontend && rm -rf node_modules package-lock.json
cd ..
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Le WebSocket ne se connecte pas

Vérifiez que :
- Le backend est démarré
- L'URL dans `frontend/.env` est correcte
- Aucun pare-feu ne bloque le port 3001

## Structure du projet

```
retroClaude/
├── backend/           # API Node.js + Express + Socket.io
│   ├── prisma/       # Schéma et migrations Prisma
│   └── src/          # Code source backend
├── frontend/         # Application React + Vite
│   └── src/          # Code source frontend
├── shared/           # Types TypeScript partagés
└── README.md
```

## Support

Pour toute question ou problème, créez une issue sur le repository GitHub.
