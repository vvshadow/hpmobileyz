# HPMobileYZ - Documentation Technique Complète

## Architecture du Système

HPMobileYZ est une application mobile de gestion hospitalière développée avec React Native pour le frontend et une API REST pour le backend. L'application suit une architecture client-serveur classique.

### Vue d'ensemble

```
+-------------------+      +-------------------+      +-------------------+
|                   |      |                   |      |                   |
|  Application      |<---->|  API REST         |<---->|  Base de données  |
|  Mobile           |      |  (Backend)        |      |                   |
|  (React Native)   |      |                   |      |                   |
+-------------------+      +-------------------+      +-------------------+
```

## Technologies Utilisées

### Frontend (Mobile)

- **React Native**: Framework JavaScript pour le développement d'applications mobiles multiplateformes
- **Expo**: Plateforme et ensemble d'outils pour simplifier le développement React Native
- **React Navigation**: Bibliothèque de navigation pour React Native
- **Expo Secure Store**: Stockage sécurisé pour les données sensibles (tokens d'authentification)
- **React Native Vector Icons**: Bibliothèque d'icônes pour l'interface utilisateur
- **Lodash**: Utilitaires JavaScript (notamment pour le debounce des recherches)

### Backend

- **API REST**: Interface de programmation suivant les principes REST
- **Authentification JWT**: Système d'authentification basé sur les JSON Web Tokens

## Structure du Projet

```
hpmobileyz/
├── assets/                # Ressources statiques (images, icônes)
├── components/            # Composants React réutilisables
│   └── Menu.jsx          # Composant de menu de navigation
├── docs/                  # Documentation
├── screens/               # Écrans de l'application
│   ├── AjouterSejourScreen.jsx    # Ajout de séjour
│   ├── LoginScreen.js             # Écran de connexion
│   ├── PatientFormScreen.jsx      # Formulaire patient (création/édition)
│   ├── PatientListScreen.jsx      # Liste des patients
│   ├── PatientViewScreen.jsx      # Détails d'un patient
│   ├── ProfileScreen.js           # Profil utilisateur
│   ├── SejourFormScreen.jsx       # Formulaire séjour (création/édition)
│   ├── SejourListScreen.jsx       # Liste des séjours
│   └── ValiderArriverScreen.jsx   # Validation d'arrivée de patient
├── server/                # Code serveur (pour le développement)
├── App.js                 # Point d'entrée de l'application
└── package.json          # Dépendances et scripts
```

## Flux de Données

### Authentification

1. L'utilisateur saisit ses identifiants sur l'écran de connexion
2. L'application envoie une requête POST à l'API d'authentification
3. En cas de succès, l'API renvoie un token JWT
4. Le token est stocké de manière sécurisée avec Expo Secure Store
5. Le token est inclus dans l'en-tête Authorization de toutes les requêtes ultérieures

### Gestion des Patients

#### Récupération de la liste des patients

```
Client                                Serveur
  |                                      |
  |  GET /api/patients                   |
  |  Authorization: Bearer {token}       |
  |------------------------------------->|
  |                                      |
  |  200 OK                              |
  |  [{patient1}, {patient2}, ...]       |
  |<-------------------------------------|
  |                                      |
```

#### Création d'un patient

```
Client                                Serveur
  |                                      |
  |  POST /api/patients                  |
  |  Authorization: Bearer {token}       |
  |  {nom, prenom, dtenaiss}             |
  |------------------------------------->|
  |                                      |
  |  201 Created                         |
  |  {id, nom, prenom, dtenaiss}         |
  |<-------------------------------------|
  |                                      |
```

### Gestion des Séjours

Les séjours hospitaliers suivent un flux similaire avec des endpoints spécifiques (/api/sejours).

## Modèles de Données

### Patient

```json
{
  "id": number,          // Identifiant unique
  "nom": string,        // Nom de famille
  "prenom": string,     // Prénom
  "dtenaiss": string    // Date de naissance (format: "YYYY-MM-DD")
}
```

### Séjour

```json
{
  "id": number,          // Identifiant unique
  "patient": {           // Objet patient associé
    "id": number,
    "nom": string,
    "prenom": string,
    "dtenaiss": string
  },
  "lit": {               // Objet lit associé
    "id": number,
    "numlit": string,
    "chambre": {         // Objet chambre associé
      "id": number,
      "numchambre": string,
      "service": {       // Objet service associé
        "id": number,
        "nomserv": string
      }
    }
  },
  "dtear": string,       // Date d'arrivée (format: "YYYY-MM-DD")
  "dtedep": string,      // Date de départ (format: "YYYY-MM-DD"), peut être null
  "arrive": string,      // Statut d'arrivée ("Oui" ou "Non")
  "commentaire": string  // Commentaire optionnel
}
```

## Composants Principaux

### PatientListScreen

Ce composant affiche la liste des patients et permet de rechercher, visualiser, modifier et supprimer des patients.

Fonctionnalités principales :
- Récupération des patients depuis l'API
- Recherche avec debounce pour optimiser les performances
- Affichage des patients sous forme de cartes
- Actions rapides (voir, modifier, supprimer)
- Confirmation de suppression via modal

### SejourListScreen

Ce composant affiche la liste des séjours hospitaliers avec des fonctionnalités similaires à PatientListScreen.

### PatientFormScreen

Formulaire réutilisable pour la création et la modification de patients.

### ValiderArriverScreen

Écran spécifique pour valider l'arrivée d'un patient lors d'un séjour hospitalier.

## Sécurité

### Authentification

L'application utilise JWT (JSON Web Tokens) pour l'authentification :

1. Les tokens sont stockés de manière sécurisée avec Expo Secure Store
2. Toutes les requêtes API incluent le token dans l'en-tête Authorization
3. Les tokens expirés sont gérés en redirigeant l'utilisateur vers l'écran de connexion

### Validation des Données

Les données sont validées à plusieurs niveaux :

1. Côté client avant l'envoi des requêtes
2. Côté serveur lors de la réception des requêtes

## Optimisations

### Performance

- Utilisation de FlatList pour le rendu efficace des listes
- Debounce sur les recherches pour limiter les appels API
- Mise en cache des données lorsque c'est approprié

### Expérience Utilisateur

- Indicateurs de chargement pendant les opérations asynchrones
- Messages d'erreur explicites
- Confirmations pour les actions destructives
- Interface responsive adaptée aux différentes tailles d'écran

## Déploiement

### Prérequis

- Node.js et npm installés
- Expo CLI installé globalement (`npm install -g expo-cli`)
- Compte Expo (pour les déploiements via Expo)

### Développement Local

1. Cloner le dépôt
2. Installer les dépendances : `npm install`
3. Démarrer le serveur de développement : `expo start` ou `npm start`

### Production

1. Configurer les variables d'environnement pour la production
2. Construire l'application : `expo build:android` ou `expo build:ios`
3. Soumettre aux stores respectifs (Google Play Store, Apple App Store)

## Maintenance et Évolution

### Bonnes Pratiques

- Suivre les conventions de nommage React Native
- Documenter le code avec des commentaires appropriés
- Utiliser des composants réutilisables
- Séparer la logique métier de l'interface utilisateur

### Évolutions Futures

- Implémentation de tests automatisés
- Amélioration de l'accessibilité
- Support hors ligne avec synchronisation
- Notifications push pour les événements importants

---

*Cette documentation technique est destinée aux développeurs et mainteneurs de l'application HPMobileYZ.*