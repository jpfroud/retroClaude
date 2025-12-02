# 🐳 Docker Quick Start

Démarrez l'application complète en 3 commandes avec Docker Compose.

## Prérequis

- Docker Desktop installé ([télécharger ici](https://www.docker.com/products/docker-desktop))
- Git

## Démarrage Rapide

```bash
# 1. Cloner le repository (si ce n'est pas déjà fait)
git clone https://github.com/jpfroud/retroClaude.git
cd retroClaude

# 2. Créer le fichier d'environnement
cp .env.docker.example .env

# 3. Démarrer tous les services (PostgreSQL + Backend + Frontend)
docker-compose up -d

# Voir les logs
docker-compose logs -f

# L'application sera accessible sur http://localhost
```

## URLs

- **Frontend** : http://localhost (port 80)
- **Backend API** : http://localhost:3001
- **PostgreSQL** : localhost:5432

## Commandes Utiles

```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ efface la base de données)
docker-compose down -v

# Reconstruire après des changements de code
docker-compose up --build

# Voir les logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend

# Redémarrer un service
docker-compose restart backend

# Accéder au shell d'un conteneur
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d retroclaudeapp
```

## Configuration

Éditez le fichier `.env` pour personnaliser :

```bash
# Mot de passe PostgreSQL
POSTGRES_PASSWORD=votre_mot_de_passe_securise

# Secret JWT pour l'authentification
JWT_SECRET=votre-secret-jwt-super-securise

# URL du frontend (pour CORS)
FRONTEND_URL=http://localhost

# URL de l'API (utilisée lors du build frontend)
VITE_API_URL=http://localhost:3001
```

## Vérification

### Backend Health Check
```bash
curl http://localhost:3001/api/health
# Devrait retourner: {"status":"ok","timestamp":"..."}
```

### Frontend
Ouvrez http://localhost dans votre navigateur.

### Base de Données
```bash
docker-compose exec postgres psql -U postgres -d retroclaudeapp -c "SELECT * FROM \"User\";"
```

## Problèmes Courants

### Port déjà utilisé

**Erreur** : `Bind for 0.0.0.0:80 failed: port is already allocated`

**Solution** : Modifiez le port dans `docker-compose.yml` :
```yaml
frontend:
  ports:
    - "8080:80"  # Changez 80 en 8080
```

Puis accédez à http://localhost:8080

### Base de données ne démarre pas

**Solution** :
```bash
# Supprimer les volumes et recommencer
docker-compose down -v
docker-compose up -d
```

### Le frontend ne se connecte pas au backend

**Vérifiez** :
1. Le backend est bien démarré : `docker-compose ps`
2. L'URL est correcte dans `.env` : `VITE_API_URL=http://localhost:3001`
3. Reconstruisez le frontend : `docker-compose up --build frontend`

## Développement

Pour le développement local sans Docker, voir [INSTALLATION.md](INSTALLATION.md).

Pour le déploiement en production, voir [DEPLOYMENT.md](DEPLOYMENT.md).

## Nettoyage Complet

Pour tout supprimer (conteneurs, images, volumes) :

```bash
docker-compose down -v --rmi all
```

---

**Prêt à démarrer !** 🚀

L'application complète (frontend + backend + PostgreSQL) devrait maintenant tourner sur votre machine.
