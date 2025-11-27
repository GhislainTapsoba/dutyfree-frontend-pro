# Guide du système de notifications

## Vue d'ensemble

Le système de notifications a été entièrement implémenté dans l'application Duty Free. Il permet de :

- Recevoir des alertes automatiques pour le stock faible, les péremptions, etc.
- Gérer ses préférences de notification
- Consulter l'historique complet des notifications
- Marquer comme lu ou supprimer des notifications

## Accès aux notifications

### 1. Centre de notifications (Header)

Le centre de notifications est accessible depuis l'icône 🔔 dans le header de l'application.

**Fonctionnalités :**
- Badge avec le nombre de notifications non lues
- Liste des 50 dernières notifications
- Filtrage "Toutes" / "Non lues"
- Actions rapides :
  - Marquer une notification comme lue
  - Supprimer une notification
  - Marquer toutes comme lues
- Accès rapide à la page complète

**Raccourci :** Cliquez sur l'icône 🔔 dans le header

### 2. Page complète des notifications

Accessible via le menu latéral : **Principal > Notifications**

**Fonctionnalités :**
- Vue de toutes les notifications avec statistiques
- Filtres avancés :
  - Par type (Stock, Péremption, Commandes, Promotions, Système)
  - Par statut (Toutes, Non lues, Lues)
- Sélection multiple pour actions en masse
- Actions disponibles :
  - Marquer comme lu (sélection ou tout)
  - Supprimer (sélection)
  - Sélectionner tout / désélectionner tout

**URL :** `/dashboard/notifications`

### 3. Préférences de notification

Accessible depuis la page des notifications : **Bouton "Préférences"**

**Configuration disponible :**

#### Canaux de notification
- ✉️ Notifications par email
- 📱 Notifications push

#### Types de notifications
- 📦 **Alertes de stock** - Stock faible, rupture, réapprovisionnement
- 📅 **Alertes de péremption** - Produits périmés ou bientôt périmés
- 🛒 **Mises à jour de commandes** - Nouvelles commandes, livraisons, paiements
- 🏷️ **Alertes promotionnelles** - Nouvelles promotions, offres spéciales
- ⚙️ **Alertes système** - Mises à jour, maintenance, sécurité

#### Seuils d'alerte
- **Seuil de stock faible** : Définir la quantité minimale pour recevoir une alerte (par défaut: 10)
- **Délai d'alerte de péremption** : Nombre de jours avant la date de péremption pour recevoir une alerte (par défaut: 30)

#### Actions de nettoyage
- Marquer toutes les notifications comme lues
- Supprimer les notifications de plus de 30 jours

**URL :** `/dashboard/notifications/preferences`

## Types de notifications

### 1. Alertes de stock 📦

**Quand ?**
- Stock en dessous du seuil défini (par défaut: 10 unités)
- Rupture de stock (quantité = 0)

**Priorités :**
- 🔴 **Urgent** : Rupture de stock
- 🟠 **Élevé** : Stock faible

**Exemple :**
> **Stock faible**
> Le produit "Whisky Jack Daniel's" a un stock faible (5/10)

### 2. Alertes de péremption 📅

**Quand ?**
- Produit déjà périmé
- Produit bientôt périmé (selon le délai configuré)

**Priorités :**
- 🔴 **Urgent** : Périmé ou expire dans moins de 7 jours
- 🟠 **Élevé** : Expire dans 8-14 jours
- 🟡 **Moyen** : Expire dans 15-30 jours

**Exemple :**
> **Produit bientôt périmé**
> Le lot "LOT-2025-001" du produit "Chocolat Lindt" expire dans 5 jours (Quantité: 45)

### 3. Mises à jour de commandes 🛒

**Quand ?**
- Nouvelle commande créée
- Commande expédiée
- Commande livrée
- Changement de statut

**Priorité :** 🟡 Moyen

**Exemple :**
> **Commande livrée**
> La commande #BC-2025-042 a été livrée avec succès

### 4. Alertes promotionnelles 🏷️

**Quand ?**
- Nouvelle promotion créée
- Promotion activée
- Promotion bientôt expirée

**Priorité :** ⚪ Faible

**Exemple :**
> **Nouvelle promotion**
> Une promotion de 20% a été activée sur la catégorie "Spiritueux"

### 5. Alertes système ⚙️

**Quand ?**
- Maintenance planifiée
- Mise à jour système
- Problèmes de sécurité
- Informations importantes

**Priorité :** Variable (Moyen à Élevé)

**Exemple :**
> **Maintenance planifiée**
> Le système sera en maintenance de 2h à 4h du matin

## Notifications automatiques

Le système vérifie automatiquement :

### Vérification du stock
- **Fréquence :** Toutes les 6 heures
- **Action :** Crée des notifications pour les produits en stock faible ou rupture
- **Déduplication :** Évite les doublons pendant 24h

### Vérification des péremptions
- **Fréquence :** Tous les jours à 6h du matin
- **Action :** Crée des notifications pour les lots périmés ou bientôt périmés
- **Déduplication :** Évite les doublons pendant 24h

## Interface utilisateur

### Icônes par type

- 📦 Package (orange) : Alertes de stock
- 📅 Calendar (jaune) : Alertes de péremption
- ✅ CheckCircle (bleu) : Mises à jour de commandes
- 🏷️ Tag (violet) : Promotions
- ⚙️ Server (gris) : Système

### Badges de priorité

- 🔴 **Urgent** : Nécessite une action immédiate
- 🟠 **Élevé** : Important, à traiter rapidement
- 🟡 **Moyen** : Notification standard
- ⚪ **Faible** : Information

### Indicateurs visuels

- **Point bleu** : Notification non lue
- **Badge rouge** : Nombre de notifications non lues
- **Fond coloré** : Couleur selon la priorité
- **Timestamps** : Affichage relatif ("Il y a 5 min", "Il y a 2h", etc.)

## Actions disponibles

### Sur une notification

1. **Marquer comme lue** : Cliquez sur l'icône ✓
2. **Supprimer** : Cliquez sur l'icône 🗑️
3. **Voir les détails** : Cliquez sur "Voir les détails →" (si disponible)

### Actions en masse

1. **Sélectionner plusieurs** : Cochez les cases des notifications
2. **Tout sélectionner** : Bouton "Tout sélectionner"
3. **Marquer comme lu** : Bouton "Marquer comme lu (X)"
4. **Supprimer** : Bouton "Supprimer (X)"
5. **Tout marquer comme lu** : Bouton "Tout marquer comme lu"

## Statistiques

La page des notifications affiche 4 cartes de statistiques :

1. **Total** : Nombre total de notifications
2. **Non lues** : Notifications non consultées (bleu)
3. **Lues** : Notifications déjà consultées (vert)
4. **Urgentes** : Notifications urgentes uniquement (rouge)

## Bonnes pratiques

### Pour les utilisateurs

1. **Consultez régulièrement** vos notifications pour ne pas manquer d'alertes importantes
2. **Configurez vos préférences** selon vos besoins et responsabilités
3. **Ajustez les seuils** pour éviter trop de notifications
4. **Nettoyez régulièrement** les anciennes notifications
5. **Activez uniquement** les types de notifications pertinents pour votre rôle

### Seuils recommandés

- **Caissier** : Seuil stock = 5, Péremption = 7 jours
- **Gestionnaire de stock** : Seuil stock = 10, Péremption = 30 jours
- **Directeur** : Seuil stock = 15, Péremption = 30 jours

## Exemples de scénarios

### Scénario 1 : Rupture de stock

1. Le système détecte que "Champagne Moët" est à 0 en stock
2. Une notification **URGENTE** est envoyée à tous les gestionnaires de stock
3. Le gestionnaire reçoit l'alerte dans le header (badge rouge)
4. Il clique sur la notification et accède à la fiche produit
5. Il crée un bon de commande pour réapprovisionner

### Scénario 2 : Produit bientôt périmé

1. Le système détecte qu'un lot expire dans 5 jours
2. Une notification **URGENTE** est envoyée
3. Le gestionnaire consulte la notification
4. Il décide de créer une promotion pour écouler le stock
5. Il marque la notification comme lue après action

### Scénario 3 : Nouvelle commande

1. Une commande fournisseur est créée
2. Une notification **MOYENNE** est envoyée au directeur
3. Le directeur valide la commande
4. Une notification de mise à jour est envoyée
5. À la livraison, une nouvelle notification confirme la réception

## Dépannage

### Je ne reçois pas de notifications

1. Vérifiez vos **préférences de notification**
2. Assurez-vous que le type de notification est **activé**
3. Vérifiez que vous êtes bien **connecté**

### Trop de notifications

1. Ajustez les **seuils** dans les préférences
2. Désactivez les types **non pertinents** pour votre rôle
3. Utilisez les **filtres** pour voir uniquement ce qui vous intéresse

### Notifications qui ne se marquent pas comme lues

1. Actualisez la page (F5)
2. Vérifiez votre connexion internet
3. Déconnectez-vous et reconnectez-vous

## Support

Pour toute question ou problème avec le système de notifications, contactez votre administrateur système ou consultez la documentation technique.

---

**Version :** 1.0.0
**Dernière mise à jour :** 2025-01-27
