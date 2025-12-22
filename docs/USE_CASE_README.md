# Diagramme de Cas d'Utilisation Global - BankRisk

## Comment utiliser ce fichier

### Option 1: PlantUML Online
1. Allez sur http://www.plantuml.com/plantuml/uml/
2. Copiez le contenu de `use_case_global.puml`
3. Collez-le dans l'éditeur
4. Le diagramme s'affichera automatiquement

### Option 2: VS Code
1. Installez l'extension "PlantUML" dans VS Code
2. Ouvrez `use_case_global.puml`
3. Appuyez sur `Alt+D` pour prévisualiser

### Option 3: Export PNG/SVG
Utilisez PlantUML en ligne de commande:
```bash
java -jar plantuml.jar use_case_global.puml
```

## Description des Cas d'Utilisation

### 🔐 Gestion des Comptes
- **UC1**: S'inscrire - Création d'un nouveau compte client
- **UC2**: Se connecter - Authentification JWT
- **UC3**: Se déconnecter - Invalidation de session
- **UC4**: Gérer profil - Modification des informations personnelles

### 💳 Gestion des Demandes de Crédit
- **UC5**: Soumettre demande - Création d'une nouvelle demande de crédit
- **UC6**: Consulter mes demandes - Visualisation de l'historique client
- **UC7**: Modifier demande - Édition des demandes en attente
- **UC8**: Évaluer demande - Analyse par l'admin avec IA
- **UC9**: Approuver/Rejeter - Décision finale de l'admin
- **UC10**: Consulter toutes les demandes - Vue admin de toutes les demandes

### 🤖 Analyse de Risque (IA)
- **UC11**: Calculer score de risque - Algorithme KNN (0-100%)
- **UC12**: Déterminer taux d'intérêt - Calcul basé sur le risque
- **UC13**: Générer rapport d'analyse - Explications détaillées
- **UC14**: Consulter historique - Historique des analyses

### 💬 Messagerie Sécurisée
- **UC15**: Envoyer message avec PDF - Communication admin → client
- **UC16**: Consulter messages - Visualisation des conversations
- **UC17**: Répondre à un message - Communication bidirectionnelle
- **UC18**: Télécharger pièce jointe - Récupération des PDFs
- **UC19**: Supprimer pièce jointe - Gestion admin uniquement

### 📊 Tableaux de Bord
- **UC20**: Dashboard client - Vue personnalisée du client
- **UC21**: Dashboard admin - Vue globale avec statistiques
- **UC22**: Générer statistiques - Agrégation de données
- **UC23**: Exporter rapports - Export CSV/PDF

### 👥 Gestion des Clients (Admin)
- **UC24**: Consulter liste des clients - Vue de tous les clients
- **UC25**: Créer nouveau client - Ajout manuel par admin
- **UC26**: Modifier client - Édition des informations
- **UC27**: Supprimer client - Suppression avec cascade

## Relations

### Include (obligatoire)
- UC5 → UC11: Toute soumission déclenche l'analyse IA
- UC8 → UC11, UC12, UC13: L'évaluation inclut le scoring complet

### Extend (optionnel)
- UC6 → UC7: Possibilité de modifier depuis la consultation
- UC10 → UC8: Possibilité d'évaluer depuis la liste
- UC16 → UC17: Possibilité de répondre depuis la consultation

## Acteurs

### 👤 Client
- Utilisateur final demandant un crédit
- Accès limité à ses propres données
- Peut consulter et répondre aux messages

### 👨‍💼 Administrateur
- Personnel de la banque
- Accès complet à toutes les fonctionnalités
- Gère les demandes et communique avec les clients

### 🤖 Système IA
- Algorithme KNN automatisé
- Calcule les scores de risque
- Génère les recommandations

## Technologies Utilisées

- **Backend**: Django + MongoDB
- **Frontend**: React + Material-UI
- **IA**: K-Nearest Neighbors (KNN)
- **Dataset**: German Credit Data (1000 enregistrements)
- **Messagerie**: Upload PDF sécurisé (max 5MB)
