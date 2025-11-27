# Duty Free Manager - Frontend

Interface web Next.js pour le système de gestion Duty Free de l'aéroport international de Ouagadougou.

## 🚀 Fonctionnalités

- **Tableau de bord** - Vue d'ensemble des ventes, stock et KPIs
- **Gestion des produits** - Catalogue complet avec catégories
- **Point de vente (POS)** - Interface de caisse intuitive
- **Stock & Inventaire** - Suivi des mouvements et alertes
- **Utilisateurs** - Gestion des accès et permissions
- **Fournisseurs** - Gestion des commandes d'achat
- **Rapports** - Analytics et exports CSV
- **Paiements** - Multi-devises (XOF, EUR, USD)

## 📋 Prérequis

- Node.js 18+
- npm ou pnpm
- Backend API en cours d'exécution sur le port 3001

## 🛠️ Installation

```bash
# Cloner le projet
cd dutyfree-frontend-pro

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
```

### Variables d'environnement

Créez un fichier `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🚀 Démarrage

### Mode développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### Mode production

```bash
npm run build
npm start
```

## 🏗️ Architecture

### Structure des dossiers

```
dutyfree-frontend-pro/
├── app/                          # Pages Next.js App Router
│   ├── (dashboard)/             # Groupe de routes dashboard
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # Tableau de bord
│   │   │   ├── products/        # Gestion produits
│   │   │   ├── stock/           # Gestion stock
│   │   │   ├── users/           # Gestion utilisateurs
│   │   │   ├── reports/         # Rapports
│   │   │   ├── suppliers/       # Fournisseurs
│   │   │   └── payments/        # Paiements
│   │   └── layout.tsx           # Layout dashboard
│   ├── login/                   # Page de connexion
│   └── layout.tsx               # Layout racine
├── components/                   # Composants React
│   ├── ui/                      # Composants UI (shadcn)
│   ├── auth/                    # Composants auth
│   ├── layout/                  # Header, sidebar
│   ├── dashboard/               # Composants dashboard
│   ├── products/                # Composants produits
│   └── ...
├── lib/                         # Utilitaires et services
│   ├── api/                     # Services API
│   │   ├── client.ts           # Client HTTP
│   │   ├── index.ts            # Export central
│   │   └── services/           # Services par module
│   │       ├── auth.service.ts
│   │       ├── products.service.ts
│   │       ├── sales.service.ts
│   │       ├── stock.service.ts
│   │       ├── users.service.ts
│   │       ├── reports.service.ts
│   │       ├── suppliers.service.ts
│   │       └── payments.service.ts
│   └── utils.ts                # Utilitaires
├── styles/                      # Styles globaux
├── public/                      # Fichiers statiques
└── middleware.ts                # Middleware d'authentification
```

### Services API

Tous les services sont organisés dans `lib/api/services/` :

```typescript
import { productsService, salesService, stockService } from '@/lib/api'

// Exemple d'utilisation
const response = await productsService.getProducts({ in_stock: true })
if (response.data) {
  console.log(response.data)
}
```

#### Services disponibles

- **authService** - Authentification (login, logout, getCurrentUser)
- **productsService** - Produits et catégories
- **salesService** - Ventes et tickets
- **stockService** - Stock, mouvements, lots
- **usersService** - Utilisateurs et rôles
- **reportsService** - Rapports et analytics
- **suppliersService** - Fournisseurs et commandes
- **paymentsService** - Paiements et devises

## 🔐 Authentification

L'authentification utilise JWT tokens stockés dans localStorage:

```typescript
// Login
const response = await authService.login({ email, password })
if (response.data?.token) {
  // Token automatiquement stocké et ajouté aux requêtes
}

// Logout
await authService.logout()

// Vérifier l'authentification
if (authService.isAuthenticated()) {
  // Utilisateur connecté
}
```

Le middleware (`middleware.ts`) protège automatiquement les routes du dashboard.

## 📱 Pages principales

### Dashboard (`/dashboard`)
- Statistiques du jour
- Graphique des ventes
- Top produits
- Ventes récentes
- Alertes stock

### Produits (`/dashboard/products`)
- Liste des produits avec filtres
- Ajout/modification de produits
- Gestion des catégories
- Import/export

### Stock (`/dashboard/stock`)
- Vue d'ensemble du stock
- Mouvements de stock
- Lots et sommiers (douanes)
- Alertes de réapprovisionnement

### Utilisateurs (`/dashboard/users`)
- Liste des utilisateurs
- Gestion des rôles et permissions
- Création de comptes

### Rapports (`/dashboard/reports`)
- Rapport des ventes
- Performance caissiers
- KPIs (ticket moyen, taux capture)
- Export CSV

## 🎨 UI/UX

L'interface utilise:
- **shadcn/ui** - Composants UI modernes
- **Tailwind CSS** - Styling utility-first
- **Lucide React** - Icônes
- **Recharts** - Graphiques
- **React Hook Form** - Gestion des formulaires
- **Zod** - Validation

### Thème

Support du mode sombre/clair via `next-themes`.

## 🌐 API Backend

Le frontend communique avec l'API backend sur le port 3001.

Voir la [documentation de connexion](./CONNEXION_BACKEND.md) pour plus de détails.

## 📦 Dépendances principales

```json
{
  "next": "16.0.3",
  "react": "19.2.0",
  "react-dom": "19.2.0",
  "@radix-ui/*": "Composants UI",
  "lucide-react": "Icônes",
  "recharts": "Graphiques",
  "react-hook-form": "Formulaires",
  "zod": "Validation",
  "date-fns": "Manipulation dates",
  "tailwindcss": "Styling"
}
```

## 🔧 Scripts disponibles

```bash
npm run dev      # Démarrer en mode développement
npm run build    # Compiler pour production
npm run start    # Démarrer en mode production
npm run lint     # Vérifier le code
```

## 🐛 Débogage

### Problèmes de connexion API

1. Vérifiez que le backend tourne sur le port 3001
2. Vérifiez `.env.local` contient `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
3. Ouvrez la console du navigateur pour voir les erreurs
4. Vérifiez le Network tab pour voir les requêtes

### Problèmes d'authentification

1. Vérifiez que le token est stocké dans localStorage
2. Ouvrez les DevTools > Application > Local Storage
3. Le token doit être sous la clé `auth_token`

## 📖 Documentation

- [Connexion Backend](./CONNEXION_BACKEND.md) - Guide de connexion frontend-backend
- [Backend README](../dutyfree-backend-pro/README.md) - Documentation de l'API

## 🤝 Contribution

Ce projet est développé pour l'aéroport international de Ouagadougou.

## 📝 License

Propriétaire - Tous droits réservés

---

**Note**: Ce projet fait partie du système Duty Free Manager comprenant:
- Frontend (ce projet) - Interface utilisateur
- Backend API - Serveur Next.js sur port 3001
- Base de données Supabase
# dutyfree-frontend-pro
