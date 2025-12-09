# Guide du système de permissions

## Vue d'ensemble

Le système de gestion des permissions est entièrement implémenté et permet un contrôle d'accès granulaire basé sur les rôles utilisateurs. Chaque utilisateur se voit attribuer un rôle qui détermine ses permissions d'accès aux différentes fonctionnalités de l'application.

## Rôles disponibles

### 1. **Administrateur** (`admin`)
- **Accès** : Complet, toutes les fonctionnalités
- **Responsabilités** : Gestion complète du système
- **Cas d'usage** : Directeur, Gérant

### 2. **Gestionnaire** (`manager`)
- **Accès** : Gestion opérationnelle complète sauf suppression de données critiques
- **Responsabilités** : Gestion quotidienne, validation des opérations
- **Cas d'usage** : Responsable de magasin, Chef de département

### 3. **Caissier** (`cashier`)
- **Accès** : Point de vente, consultation produits et clients
- **Responsabilités** : Ventes, encaissements
- **Cas d'usage** : Personnel de caisse

### 4. **Magasinier** (`warehouseman`)
- **Accès** : Gestion du stock, inventaires, commandes
- **Responsabilités** : Réception, stockage, inventaires
- **Cas d'usage** : Responsable d'entrepôt, Magasinier

### 5. **Comptable** (`accountant`)
- **Accès** : Finances, rapports, factures
- **Responsabilités** : Comptabilité, analyses financières
- **Cas d'usage** : Comptable, Contrôleur financier

## Matrice des permissions

| Fonctionnalité | Admin | Manager | Cashier | Warehouseman | Accountant |
|----------------|-------|---------|---------|--------------|------------|
| **Dashboard** |
| Tableau de bord | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Point de Vente** |
| Voir POS | ✅ | ✅ | ✅ | ❌ | ❌ |
| Créer vente | ✅ | ✅ | ✅ | ❌ | ❌ |
| Annuler vente | ✅ | ✅ | ❌ | ❌ | ❌ |
| Appliquer remise | ✅ | ✅ | ❌ | ❌ | ❌ |
| Appliquer promotion | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Produits** |
| Voir produits | ✅ | ✅ | ✅ | ✅ | ✅ |
| Créer produit | ✅ | ✅ | ❌ | ❌ | ❌ |
| Modifier produit | ✅ | ✅ | ❌ | ❌ | ❌ |
| Supprimer produit | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gérer prix | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Fiches Techniques** |
| Voir fiches | ✅ | ✅ | ❌ | ✅ | ❌ |
| Modifier fiches | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Stock** |
| Voir stock | ✅ | ✅ | ✅ | ✅ | ❌ |
| Gérer stock | ✅ | ✅ | ❌ | ✅ | ❌ |
| Ajuster stock | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Inventaires** |
| Voir inventaires | ✅ | ✅ | ❌ | ✅ | ❌ |
| Créer inventaire | ✅ | ✅ | ❌ | ✅ | ❌ |
| Valider inventaire | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Fournisseurs** |
| Voir fournisseurs | ✅ | ✅ | ❌ | ✅ | ❌ |
| Créer fournisseur | ✅ | ✅ | ❌ | ❌ | ❌ |
| Modifier fournisseur | ✅ | ✅ | ❌ | ❌ | ❌ |
| Supprimer fournisseur | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Bons de Commande** |
| Voir bons | ✅ | ✅ | ❌ | ✅ | ✅ |
| Créer bon | ✅ | ✅ | ❌ | ✅ | ❌ |
| Modifier bon | ✅ | ✅ | ❌ | ❌ | ❌ |
| Supprimer bon | ✅ | ❌ | ❌ | ❌ | ❌ |
| Valider bon | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Factures Fournisseurs** |
| Voir factures | ✅ | ✅ | ❌ | ✅ | ✅ |
| Créer facture | ✅ | ✅ | ❌ | ❌ | ✅ |
| Valider facture | ✅ | ✅ | ❌ | ❌ | ✅ |
| Supprimer facture | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Promotions** |
| Voir promotions | ✅ | ✅ | ❌ | ❌ | ❌ |
| Créer promotion | ✅ | ✅ | ❌ | ❌ | ❌ |
| Modifier promotion | ✅ | ✅ | ❌ | ❌ | ❌ |
| Supprimer promotion | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Fidélité** |
| Voir fidélité | ✅ | ✅ | ✅ | ❌ | ❌ |
| Gérer fidélité | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Menus & Formules** |
| Voir menus | ✅ | ✅ | ❌ | ❌ | ❌ |
| Créer menu | ✅ | ✅ | ❌ | ❌ | ❌ |
| Modifier menu | ✅ | ✅ | ❌ | ❌ | ❌ |
| Supprimer menu | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Clients Hébergés** |
| Voir clients | ✅ | ✅ | ✅ | ❌ | ❌ |
| Créer client | ✅ | ✅ | ❌ | ❌ | ❌ |
| Modifier client | ✅ | ✅ | ❌ | ❌ | ❌ |
| Supprimer client | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Paiements** |
| Voir paiements | ✅ | ✅ | ✅ | ❌ | ✅ |
| Gérer paiements | ✅ | ✅ | ❌ | ❌ | ✅ |
| Rembourser | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Rapports** |
| Voir rapports | ✅ | ✅ | ❌ | ✅ | ✅ |
| Exporter rapports | ✅ | ✅ | ❌ | ❌ | ✅ |
| Rapports financiers | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Configuration** |
| Voir points de vente | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gérer points de vente | ✅ | ❌ | ❌ | ❌ | ❌ |
| Voir devises | ✅ | ✅ | ❌ | ❌ | ✅ |
| Gérer devises | ✅ | ❌ | ❌ | ❌ | ❌ |
| Voir utilisateurs | ✅ | ✅ | ❌ | ❌ | ❌ |
| Créer utilisateur | ✅ | ❌ | ❌ | ❌ | ❌ |
| Modifier utilisateur | ✅ | ❌ | ❌ | ❌ | ❌ |
| Supprimer utilisateur | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gérer rôles | ✅ | ❌ | ❌ | ❌ | ❌ |
| Voir paramètres | ✅ | ✅ | ❌ | ❌ | ❌ |
| Modifier paramètres | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Notifications** |
| Voir notifications | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gérer notifications | ✅ | ❌ | ❌ | ❌ | ❌ |

## Utilisation dans le code

### 1. Hook `usePermissions`

```typescript
import { usePermissions } from "@/hooks/use-permissions"

function MyComponent() {
  const { can, canAny, canAll, isAdmin, roleCode } = usePermissions()

  // Vérifier une permission unique
  if (can("products.create")) {
    // Afficher le bouton "Créer produit"
  }

  // Vérifier plusieurs permissions (OU logique)
  if (canAny(["products.edit", "products.delete"])) {
    // Afficher les actions
  }

  // Vérifier plusieurs permissions (ET logique)
  if (canAll(["products.view", "products.edit"])) {
    // Afficher l'éditeur
  }

  // Vérifier le rôle
  if (isAdmin) {
    // Fonctionnalités admin
  }
}
```

### 2. Composant `<Can>`

```typescript
import { Can } from "@/components/auth/can"

function ProductsPage() {
  return (
    <div>
      <h1>Produits</h1>

      {/* Afficher uniquement si l'utilisateur a la permission */}
      <Can permission="products.create">
        <Button>Créer un produit</Button>
      </Can>

      {/* Avec plusieurs permissions (OU logique par défaut) */}
      <Can permissions={["products.edit", "products.delete"]} requireAll={false}>
        <DropdownMenu>
          <Can permission="products.edit">
            <MenuItem>Modifier</MenuItem>
          </Can>
          <Can permission="products.delete">
            <MenuItem>Supprimer</MenuItem>
          </Can>
        </DropdownMenu>
      </Can>

      {/* Avec fallback */}
      <Can permission="products.manage_prices" fallback={<p>Prix non disponible</p>}>
        <PriceEditor />
      </Can>
    </div>
  )
}
```

### 3. Protection des routes (Middleware)

Le middleware protège automatiquement toutes les routes sous `/dashboard`. Si un utilisateur essaie d'accéder à une page sans permission, il est redirigé vers `/unauthorized`.

```typescript
// Automatique - pas de code nécessaire
// Le middleware vérifie les permissions basées sur PAGE_PERMISSIONS dans lib/permissions/index.ts
```

### 4. Sidebar dynamique

Le sidebar masque automatiquement les liens vers les pages auxquelles l'utilisateur n'a pas accès.

```typescript
// Automatique - configuré dans components/layout/sidebar.tsx
// Chaque élément de menu a une propriété `permission`
```

## Configuration du rôle utilisateur

### Au moment de la connexion

Le rôle de l'utilisateur doit être stocké dans un cookie `user_role` lors de la connexion :

```typescript
// Dans l'endpoint de login
response.cookies.set("user_role", user.role.code, {
  httpOnly: false, // Doit être accessible côté client pour le middleware
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 jours
})
```

### Structure de la table `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role_id UUID REFERENCES roles(id),
  -- autres champs...
)
```

### Structure de la table `roles`

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL, -- 'admin', 'manager', 'cashier', etc.
  name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSONB, -- Peut stocker des permissions personnalisées
  created_at TIMESTAMP DEFAULT NOW()
)
```

## Ajout d'une nouvelle permission

### 1. Définir la permission

Dans `lib/permissions/index.ts` :

```typescript
export type Permission =
  | "existing.permission"
  | "new_feature.view" // Nouvelle permission
  | "new_feature.edit" // Nouvelle permission

// Ajouter aux rôles appropriés
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    // ...permissions existantes
    "new_feature.view",
    "new_feature.edit",
  ],
  manager: [
    // ...permissions existantes
    "new_feature.view",
  ],
  // ...autres rôles
}
```

### 2. Configurer la page

```typescript
export const PAGE_PERMISSIONS: Record<string, Permission[]> = {
  // ...pages existantes
  "/dashboard/new-feature": ["new_feature.view"],
}
```

### 3. Ajouter au menu

Dans `components/layout/sidebar.tsx` :

```typescript
{
  title: "Gestion",
  items: [
    // ...items existants
    {
      name: "Nouvelle fonctionnalité",
      href: "/dashboard/new-feature",
      icon: IconName,
      permission: "new_feature.view"
    },
  ],
}
```

### 4. Utiliser dans la page

```typescript
import { Can } from "@/components/auth/can"
import { usePermissions } from "@/hooks/use-permissions"

export default function NewFeaturePage() {
  const { can } = usePermissions()

  return (
    <div>
      <h1>Nouvelle fonctionnalité</h1>

      <Can permission="new_feature.edit">
        <Button>Modifier</Button>
      </Can>
    </div>
  )
}
```

## Gestion des erreurs

### Page non autorisée

L'utilisateur est redirigé vers `/unauthorized` avec un compte à rebours de 10 secondes avant redirection automatique vers le dashboard.

### Pages accessibles sans authentification

- `/` - Page d'accueil
- `/login` - Page de connexion
- `/unauthorized` - Page d'accès refusé

## Bonnes pratiques

1. **Principe du moindre privilège** : Donner uniquement les permissions nécessaires
2. **Permissions granulaires** : Préférer plusieurs permissions spécifiques à une permission générale
3. **Hiérarchie claire** : Admin > Manager > Autres rôles
4. **Validation côté serveur** : Toujours vérifier les permissions dans les endpoints API
5. **UX cohérente** : Masquer les fonctionnalités inaccessibles plutôt que de les désactiver

## Dépannage

### Les permissions ne fonctionnent pas

1. Vérifier que le cookie `user_role` est bien défini après la connexion
2. Vérifier que le rôle existe dans `ROLE_PERMISSIONS`
3. Actualiser la page après avoir modifié les permissions

### Le sidebar est vide

- Le rôle de l'utilisateur n'a probablement aucune permission
- Vérifier que `usePermissions` retourne le bon `roleCode`

### Redirection infinie

- Vérifier que la page `/unauthorized` est bien dans les exceptions du middleware
- Vérifier que le token d'authentification est valide

## Support

Pour toute question sur le système de permissions, consultez la documentation technique ou contactez l'équipe de développement.

---

**Version :** 1.0.0
**Dernière mise à jour :** 2025-01-27
