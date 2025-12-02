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
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # Composants réutilisables (Timer, PhaseHeader, etc.)
│   │   │   └── phases/      # Composants pour chaque phase
│   │   ├── pages/           # Pages principales (Home, CreateRetro, JoinRetro, RetroRoom)
│   │   ├── services/        # Services API et WebSocket
│   │   └── store/           # State management (Zustand)
├── backend/           # API Node.js + WebSocket
│   ├── src/
│   │   ├── controllers/     # Contrôleurs REST
│   │   ├── routes/          # Routes API
│   │   ├── services/        # Services (WebSocket, etc.)
│   │   └── index.ts         # Point d'entrée
│   └── prisma/
│       └── schema.prisma    # Schéma de base de données
├── shared/            # Types TypeScript partagés
├── INSTALLATION.md    # Guide d'installation détaillé
├── GUIDE_UTILISATEUR.md  # Guide d'utilisation complet
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

## 🎯 Statut du Projet

✅ **Version 1.0 - Complète et Fonctionnelle**

- [x] Architecture et structure du projet
- [x] Modèles de données (Prisma + PostgreSQL)
- [x] API Backend REST
- [x] WebSocket pour temps réel
- [x] Interface utilisateur complète
- [x] Toutes les 10 phases de rétrospective implémentées
- [x] Collaboration temps réel
- [x] Système d'invitation (code + QR code)
- [x] Timer configurable par phase
- [x] Gestion des rôles (facilitateur/participant)
- [x] Mode anonyme
- [x] Templates de rétrospective (Classique, 4L, Start-Stop-Continue, Personnalisé)

### 🚧 Améliorations Futures

- [ ] Tests unitaires et d'intégration
- [ ] Authentification utilisateur persistante
- [ ] Historique des rétrospectives
- [ ] Export des résultats (PDF, Excel)
- [ ] Notifications email
- [ ] Thème sombre
- [ ] Multi-langue

## 📚 Documentation

- **[INSTALLATION.md](INSTALLATION.md)** - Guide d'installation détaillé avec résolution de problèmes
- **[GUIDE_UTILISATEUR.md](GUIDE_UTILISATEUR.md)** - Guide complet d'utilisation avec toutes les phases expliquées

## 🎮 Utilisation

1. **Installez** l'application (voir INSTALLATION.md)
2. **Démarrez** le backend et le frontend
3. **Créez** une rétrospective depuis la page d'accueil
4. **Invitez** vos collègues via le code ou QR code
5. **Suivez** les phases guidées de la rétrospective
6. **Profitez** de la collaboration en temps réel !

## 📄 Licence

MIT
