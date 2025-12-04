# Corrections Frontend - API URL Configuration

## Problème Identifié

Le frontend appelait les endpoints API sur le mauvais port (`localhost:3000`) au lieu du backend qui tourne sur `localhost:3001`, causant des erreurs 404:

```
POST http://localhost:3000/api/auth/register 404 (Not Found)
PUT http://localhost:3000/api/settings/company 404 (Not Found)
```

## Solution Appliquée

### 1. ✅ Fichiers Corrigés

Les composants suivants ont été mis à jour pour utiliser la variable d'environnement `NEXT_PUBLIC_API_URL`:

#### a) `components/users/user-form.tsx`
- **Problème**: Utilisait `/api/auth/register` et `/api/users/${id}` en dur
- **Solution**: Ajout de `const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'`
- **Ligne**: 35, 42

#### b) `components/settings/settings-tabs.tsx`
- **Problème**: Utilisait `/api/settings/company` en dur
- **Solution**: Ajout de l'API_URL et utilisation de `` `${API_URL}/settings/company` ``
- **Ligne**: 33, 38

#### c) `components/products/product-form.tsx`
- **Problème**: Utilisait `/api/products` et `/api/products/${id}` en dur
- **Solution**: Ajout de l'API_URL avec endpoint dynamique
- **Ligne**: 25, 51

#### d) `components/reports/reports-dashboard.tsx`
- **Problème**: Utilisait `/api/reports/export` en dur
- **Solution**: Ajout de l'API_URL au niveau du module
- **Ligne**: 25, 101

### 2. ✅ Utilitaire API Créé

Création de `lib/api.ts` - Un module centralisé pour gérer tous les appels API avec:
- Configuration automatique de l'URL backend
- Gestion automatique de l'authentification (token dans headers)
- Helpers pour GET, POST, PUT, DELETE
- Gestion d'erreurs standardisée

#### Fonctions Disponibles:

```typescript
import { apiGet, apiPost, apiPut, apiDelete, API_URL, getAuthToken } from '@/lib/api'

// Exemples d'utilisation:
const data = await apiPost('/loyalty/cards', { customer_name: 'John' })
const users = await apiGet('/users')
await apiPut('/users/123', { name: 'Jane' })
await apiDelete('/users/123')
```

## Configuration

Le fichier `.env.local` est déjà correctement configuré:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Recommandations pour l'Avenir

### Option 1: Utiliser l'utilitaire `lib/api.ts` (Recommandé)

```typescript
import { apiPost } from '@/lib/api'

const handleSubmit = async (data: any) => {
  try {
    const result = await apiPost('/loyalty/cards', data)
    console.log('Success:', result)
  } catch (error) {
    console.error('Error:', error.message)
  }
}
```

**Avantages:**
- ✅ Authentification automatique (Bearer token)
- ✅ Gestion d'erreurs standardisée
- ✅ Headers configurés automatiquement
- ✅ Credentials (cookies) inclus
- ✅ Code plus propre et DRY

### Option 2: Utiliser fetch avec API_URL

```typescript
import { API_URL, getAuthToken } from '@/lib/api'

const response = await fetch(`${API_URL}/loyalty/cards`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
  },
  credentials: 'include',
  body: JSON.stringify(data)
})
```

## Problème d'Authentification Résolu

### Backend (✅ Déjà Corrigé)

Tous les endpoints backend acceptent maintenant l'authentification via:
1. Cookie `auth_token`
2. Header `Authorization: Bearer <token>`

### Frontend (✅ Corrigé avec `lib/api.ts`)

L'utilitaire `lib/api.ts` envoie automatiquement le token via:
- Header `Authorization: Bearer <token>` si le token existe
- `credentials: 'include'` pour envoyer les cookies

## Tests

Pour tester les corrections:

1. **Vérifier que le token est disponible:**
```javascript
import { getAuthToken } from '@/lib/api'
console.log('Token:', getAuthToken())
```

2. **Tester un appel API:**
```javascript
import { apiPost } from '@/lib/api'

apiPost('/loyalty/cards', {
  customer_name: 'Test User',
  customer_email: 'test@example.com'
})
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err))
```

3. **Vérifier l'URL utilisée:**
```javascript
import { API_URL } from '@/lib/api'
console.log('API URL:', API_URL) // Devrait afficher: http://localhost:3001/api
```

## Checklist de Migration

Pour convertir d'autres composants vers le nouvel utilitaire:

- [ ] Importer `import { apiPost, apiGet, API_URL } from '@/lib/api'`
- [ ] Remplacer `fetch('/api/...')` par `apiPost('/...')`
- [ ] Supprimer la configuration manuelle des headers
- [ ] Supprimer la gestion du token manuelle
- [ ] Ajouter try/catch pour la gestion d'erreurs

### Exemple de Migration:

**Avant:**
```typescript
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
const result = await response.json()
```

**Après:**
```typescript
import { apiPost } from '@/lib/api'

const result = await apiPost('/users', data)
```

## Prochaines Étapes

1. ✅ Backend prêt et configuré (port 3001)
2. ✅ Frontend corrigé pour les composants principaux
3. ✅ Utilitaire API créé
4. 🔄 Migrer progressivement les autres composants vers `lib/api.ts`
5. 🔄 Tester l'authentification sur tous les endpoints

## Fichiers Modifiés

### Frontend:
- `components/users/user-form.tsx`
- `components/settings/settings-tabs.tsx`
- `components/products/product-form.tsx`
- `components/reports/reports-dashboard.tsx`
- `lib/api.ts` (nouveau fichier)

### Backend:
- `app/api/loyalty/cards/route.ts`
- `app/api/loyalty/cards/[id]/points/route.ts`
- `app/api/hotel-guests/route.ts`
- `app/api/point-of-sales/route.ts`
- `app/api/currencies/route.ts`
- `app/api/menus/route.ts`

## Date de Correction

2025-12-03
