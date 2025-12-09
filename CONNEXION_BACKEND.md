# Connexion Frontend-Backend - Duty Free Manager

## Vue d'ensemble

Ce frontend Next.js est maintenant connecté au backend API tournant sur le port 3001.

## Configuration

### Variables d'environnement

Le fichier `.env.local` contient la configuration de l'API:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Architecture de connexion

#### 1. Client HTTP (`lib/api/client.ts`)

Un client HTTP générique qui gère:
- Les requêtes GET, POST, PUT, PATCH, DELETE
- L'authentification par token JWT
- La gestion des erreurs
- Le stockage du token dans localStorage

#### 2. Services API (`lib/api/services/`)

Services organisés par module:

- **auth.service.ts** - Authentification (login, register, logout)
- **products.service.ts** - Gestion des produits et catégories
- **sales.service.ts** - Gestion des ventes
- **stock.service.ts** - Gestion du stock et inventaire
- **users.service.ts** - Gestion des utilisateurs et rôles
- **reports.service.ts** - Rapports et analytics

#### 3. Point d'entrée central (`lib/api/index.ts`)

Exporte tous les services pour un accès facile:

```typescript
import { services, authService, productsService } from '@/lib/api'
```

## Utilisation

### Exemple: Authentification

```typescript
import { authService } from '@/lib/api'

// Login
const response = await authService.login({
  email: 'user@example.com',
  password: 'password'
})

if (response.error) {
  console.error(response.error)
} else {
  // Token automatiquement stocké
  console.log(response.data.user)
}

// Logout
await authService.logout()
```

### Exemple: Récupérer des produits

```typescript
import { productsService } from '@/lib/api'

// Liste des produits
const response = await productsService.getProducts({
  category: 'parfums',
  in_stock: true
})

if (response.data) {
  console.log(response.data)
}

// Créer un produit
const newProduct = await productsService.createProduct({
  code: 'PROD001',
  name_fr: 'Parfum Chanel',
  price_xof: 85000,
  category_id: 'uuid-category'
})
```

### Exemple: Créer une vente

```typescript
import { salesService } from '@/lib/api'

const response = await salesService.createSale({
  cash_session_id: 'session-uuid',
  cashier_id: 'cashier-uuid',
  items: [
    {
      product_id: 'product-uuid',
      quantity: 2,
      unit_price: 85000
    }
  ],
  payments: [
    {
      method: 'card',
      currency: 'EUR',
      amount: 260,
      amount_xof: 170000
    }
  ]
})
```

## Modifications effectuées

### Fichiers supprimés

- `lib/supabase/` - Tout le dossier Supabase
- Dépendances: `@supabase/ssr`, `@supabase/supabase-js`, `@vercel/analytics`

### Fichiers créés

- `.env.local` - Variables d'environnement
- `lib/api/client.ts` - Client HTTP
- `lib/api/services/*.service.ts` - Services par module
- `lib/api/index.ts` - Point d'entrée central

### Fichiers modifiés

- `middleware.ts` - Authentification par token au lieu de Supabase
- `components/auth/login-form.tsx` - Utilise authService
- `components/layout/header.tsx` - Utilise authService pour logout
- `app/(dashboard)/dashboard/products/page.tsx` - Exemple de connexion au backend
- `package.json` - Suppression des dépendances Supabase

## Démarrage

1. **Démarrer le backend** (port 3001):
```bash
cd dutyfree-backend-pro
npm run dev
```

2. **Démarrer le frontend** (port 3000):
```bash
cd dutyfree-frontend-pro
npm install
npm run dev
```

3. Accéder à l'application: `http://localhost:3000`

## Prochaines étapes

Pour connecter d'autres pages au backend, suivez ce modèle:

1. Convertir la page en "use client" si nécessaire
2. Importer le service approprié depuis `@/lib/api`
3. Utiliser `useEffect` pour charger les données
4. Gérer les états de chargement et erreurs

### Exemple de conversion

```typescript
"use client"

import { useEffect, useState } from "react"
import { stockService, StockItem } from "@/lib/api"

export default function StockPage() {
  const [stock, setStock] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStock() {
      const response = await stockService.getStock()
      if (response.data) setStock(response.data)
      setLoading(false)
    }
    loadStock()
  }, [])

  if (loading) return <div>Chargement...</div>

  return <div>{/* Afficher le stock */}</div>
}
```

## Support

Pour toute question sur la connexion frontend-backend, consulter:
- `lib/api/` - Code source des services
- `api-tests.http` - Exemples de requêtes API
- Backend README: `dutyfree-backend-pro/README.md`
