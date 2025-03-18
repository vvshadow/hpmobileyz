# HPMobileYZ - Documentation Technique

## Architecture du Système

HPMobileYZ est une application mobile de gestion de patients développée avec React Native pour le frontend et une API REST pour le backend. L'application suit une architecture client-serveur.

### Frontend (React Native)

L'application mobile est construite avec React Native, permettant un développement cross-platform pour iOS et Android à partir d'une base de code unique.

#### Structure des Dossiers
- **src**: Contient le code source de l'application.
  - **components**: Composants réutilisables.
  - **screens**: Écrans de l'application.
  - **utils**: Fonctions utilitaires.
  - **App.js**: Point d'entrée de l'application.


#### Principales Technologies

- **React Native**: Framework pour le développement mobile
- **React Navigation**: Gestion de la navigation entre écrans
- **AsyncStorage**: Stockage local des données (token, préférences)
- **Axios**: Client HTTP pour les requêtes API

### Backend (API REST)

Le backend est une API REST développée avec Symfony, fournissant des endpoints pour l'authentification et la gestion des données patients.

#### Endpoints API

| Endpoint | Méthode | Description | Authentification |
|----------|---------|-------------|------------------|
| `/api/login_check` | POST | Authentification utilisateur | Non |
| `/api/patients` | GET | Liste des patients | Oui |
| `/api/patients` | POST | Création d'un patient | Oui |
| `/api/patients/{id}` | GET | Détails d'un patient | Oui |
| `/api/patients/{id}` | PUT | Modification d'un patient | Oui |
| `/api/patients/{id}` | DELETE | Suppression d'un patient | Oui |

## Authentification

L'application utilise l'authentification JWT (JSON Web Token):

1. L'utilisateur s'authentifie via `/api/login_check`
2. Le serveur génère un token JWT
3. Le token est stocké dans AsyncStorage
4. Toutes les requêtes API ultérieures incluent ce token dans l'en-tête Authorization

## Modèles de Données

### Patient

```json
{
  "id": number,
  "nom": string,
  "prenom": string,
  "dtenaiss": string (format: "YYYY-MM-DD")
}








## Documentation Utilisateur

```markdown:%2FApplications%2FMAMP%2Fhtdocs%2Fhpmobileyz%2Fdocs%2Fuser-doc.md
# HPMobileYZ - Guide Utilisateur


## Premiers pas

### Connexion

1. Lancez l'application HPMobileYZ
2. Sur l'écran de connexion, saisissez votre adresse email et mot de passe
3. Activez l'option "Se souvenir de moi" si vous souhaitez rester connecté
4. Appuyez sur "Se connecter"


### Navigation principale

Après connexion, vous accédez à l'écran principal qui affiche la liste des patients. La navigation s'effectue via:

- **Liste des patients**: Écran principal affichant tous les patients
- **Bouton +**: Ajouter un nouveau patient
- **Icône de profil**: Accéder aux paramètres de votre compte

## Gestion des patients

### Consulter la liste des patients

L'écran principal affiche la liste de tous les patients avec:
- Initiales et nom complet
- Identifiant unique
- Date de naissance

Utilisez la barre de recherche en haut de l'écran pour filtrer les patients par nom.

### Consulter les détails d'un patient

1. Dans la liste des patients, appuyez sur l'icône "Œil" à côté du patient souhaité
2. L'écran de détails affiche toutes les informations du patient

### Ajouter un nouveau patient

1. Sur l'écran principal, appuyez sur le bouton "+" en haut à droite
2. Remplissez le formulaire avec:
   - Nom
   - Prénom
   - Date de naissance (format AAAA-MM-JJ)
3. Appuyez sur "Créer Patient"

### Modifier un patient

1. Dans la liste des patients, appuyez sur l'icône "Crayon" à côté du patient à modifier
2. Modifiez les informations nécessaires
3. Appuyez sur "Sauvegarder"

### Supprimer un patient

1. Dans la liste des patients, appuyez sur l'icône "Corbeille" à côté du patient à supprimer
2. Une boîte de dialogue de confirmation apparaît
3. Appuyez sur "Supprimer" pour confirmer

## Fonctionnalités avancées




### Résolution des problèmes

### L'application ne se connecte pas

1. Vérifiez votre connexion internet
2. Assurez-vous que vos identifiants sont corrects
3. Si le problème persiste, contactez le support technique

### Les données ne se chargent pas

1. Vérifiez votre connexion internet
2. Essayez de vous déconnecter puis reconnecter
3. Redémarrez l'application

## Support

Pour toute assistance technique:
- Email: zayd.benoumeur@protonmail.com

