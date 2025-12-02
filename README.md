# RetroClaudeApp - Clone TeamRetro

Application de rétrospectives d'équipe collaborative en temps réel.

## 🚀 Fonctionnalités

- **Templates de rétrospective** : Classique (What went well/not well), 4L (Learned, Liked, Lacked, Longed for), Start-Stop-Continue, et templates personnalisés
- **Collaboration en temps réel** : WebSocket pour synchronisation instantanée
- **Phases de rétrospective** :
  - 🎉 Icebreaker avec questions personnalisées
  - 👋 Welcome avec vote sur l'itération
  - ✅ Revue des actions précédentes
  - 💡 Brainstorm avec tickets colorés
  - 📦 Groupement des tickets
  - 🗳️ Vote avec options configurables
  - 💬 Discussion avec actions proposées
  - 📝 Review et affectation des actions
  - 🎯 Closing avec ROTI (Return On Time Invested)
- **Invitations** : Par email ou QR code
- **Timer** : Pour chaque phase
- **Mode anonyme** : Option pour masquer les auteurs

## 🛠️ Stack Technique

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- Zustand (state management)
- Socket.io-client
- React Router

### Backend
- Node.js + Express
- Socket.io (WebSocket)
- Prisma ORM
- PostgreSQL
- JWT Authentication

## 📦 Structure du Projet

```
retroClaude/
├── frontend/          # Application React
├── backend/           # API Node.js + WebSocket
├── shared/            # Types TypeScript partagés
└── README.md
```

## 🚦 Démarrage Rapide

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Configuration backend
cd backend
cp .env.example .env
# Éditer .env avec vos configurations

# Initialiser la base de données
npx prisma migrate dev
npx prisma generate

# Démarrer le backend
npm run dev

# Dans un autre terminal - Démarrer le frontend
cd ../frontend
npm run dev
```

## 📝 Variables d'Environnement

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/retroclaudeapp"
JWT_SECRET="your-secret-key"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

## 🎯 Roadmap

- [x] Architecture et structure du projet
- [ ] Modèles de données
- [ ] API Backend
- [ ] Interface utilisateur de base
- [ ] Phases de rétrospective
- [ ] Collaboration temps réel
- [ ] Système d'invitation
- [ ] Tests

## 📄 Licence

MIT
