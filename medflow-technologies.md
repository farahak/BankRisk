# 📚 Technologies et Hooks - Projet MedFlow

## 🎯 Vue d'ensemble du projet

**MedFlow** est une application SaaS de gestion médicale comprenant :
- **Frontend** : Application React moderne
- **Backend** : API REST Django
- **Base de données** : SQLite (développement)

---

## 🚀 Technologies Frontend (React)

### **Core Technologies**

#### 1. **React 19.2.0**
- **Description** : Bibliothèque JavaScript pour construire des interfaces utilisateur
- **Utilisation** : Gestion de tous les composants UI
- **Fichier principal** : [`main.jsx`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/main.jsx)

#### 2. **React Router DOM 7.9.6**
- **Description** : Bibliothèque de routing pour React
- **Utilisation** : Navigation entre les pages (Dashboard, Login, Profile, etc.)
- **Fichier de configuration** : [`App.jsx`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/App.jsx)
- **Routes principales** :
  - `/home` - Page d'accueil
  - `/login` - Authentification
  - `/dashboard` - Tableau de bord médecin
  - `/receptionist/*` - Routes réceptionniste
  - `/profile` - Profil utilisateur

#### 3. **Vite 7.2.2**
- **Description** : Build tool et serveur de développement ultra-rapide
- **Utilisation** : Compilation et hot-reload du projet
- **Configuration** : [`vite.config.js`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/vite.config.js)

### **Gestion d'état**

#### 4. **React Context API**
- **Description** : API native React pour gérer l'état global
- **Utilisation** : Gestion de l'authentification
- **Implémentation** : [`AuthContext.jsx`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/contexts/AuthContext.jsx)

#### 5. **Redux Toolkit 2.10.1**
- **Description** : Bibliothèque de gestion d'état
- **Utilisation** : Gestion d'état avancée (prête pour extension)

#### 6. **Zustand 5.0.8**
- **Description** : Bibliothèque légère de gestion d'état
- **Utilisation** : Alternative à Redux pour des états simples

### **Requêtes HTTP**

#### 7. **Axios 1.13.2**
- **Description** : Client HTTP pour les requêtes API
- **Utilisation** : Communication avec le backend Django
- **Configuration** : [`api/axios.js`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/api/axios.js) (intercepteurs JWT)

### **UI & Styling**

#### 8. **Material-UI (MUI) 7.3.5**
- **Description** : Bibliothèque de composants React
- **Packages** :
  - `@mui/material`
  - `@emotion/react`
  - `@emotion/styled`

#### 9. **TailwindCSS 4.1.17**
- **Description** : Framework CSS utility-first
- **Utilisation** : Styling rapide des composants
- **Plugins** : `@tailwindcss/vite`

#### 10. **Lucide React 0.554.0**
- **Description** : Bibliothèque d'icônes modernes
- **Utilisation** : Icônes dans l'interface utilisateur

### **Build & Development Tools**

#### 11. **PostCSS & Autoprefixer**
- **Description** : Outils de traitement CSS
- **Utilisation** : Compatibilité cross-browser

#### 12. **ESLint 9.39.1**
- **Description** : Linter JavaScript
- **Plugins** :
  - `eslint-plugin-react-hooks` - Validation des règles des Hooks
  - `eslint-plugin-react-refresh` - Support Hot Module Replacement

---

## 🎣 React Hooks Utilisés

### **Hooks Natifs React**

#### 1. **useState**
```jsx
const [state, setState] = useState(initialValue)
```

**Signification** : Gère l'état local d'un composant

**Cas d'utilisation dans MedFlow** :
- **Formulaires** : `signup.jsx` - gestion des données de formulaire
  ```jsx
  const [formData, setFormData] = useState({
    email: '', password: '', first_name: '', last_name: '', role: 'patient'
  })
  ```
- **UI States** : `Dashboard.jsx` - gestion des statistiques
  ```jsx
  const [stats, setStats] = useState({ patients: 245, appointments: 0 })
  ```
- **Listes** : `ReceptionistDoctors.jsx` - liste des médecins
  ```jsx
  const [doctors, setDoctors] = useState([])
  ```
- **Loading States** : Indicateurs de chargement
  ```jsx
  const [loading, setLoading] = useState(true)
  ```

**Fichiers concernés** :
- [`signup.jsx`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/pages/signup.jsx)
- [`Dashboard.jsx`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/pages/Dashboard.jsx)
- [`Profile.jsx`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/pages/Profile.jsx)
- [`ReceptionistDoctors.jsx`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/pages/ReceptionistDoctors.jsx)

---

#### 2. **useEffect**
```jsx
useEffect(() => {
  // Code à exécuter
  return () => { /* cleanup */ }
}, [dependencies])
```

**Signification** : Gère les effets de bord (side effects) - requêtes API, subscriptions, timers

**Cas d'utilisation dans MedFlow** :
- **Chargement initial de données** : `Dashboard.jsx`
  ```jsx
  useEffect(() => {
    if (user?.role === 'medecin') {
      fetchDoctorData()
    }
  }, [user])
  ```
- **Authentification** : `AuthContext.jsx` - vérifier le token au montage
  ```jsx
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])
  ```
- **Filtrage en temps réel** : `ReceptionistAppointments.jsx`
  ```jsx
  useEffect(() => {
    // Filtrer les rendez-vous selon le terme de recherche
  }, [searchTerm, appointments])
  ```

**Fichiers concernés** :
- [`Dashboard.jsx`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/pages/Dashboard.jsx)
- [`AuthContext.jsx`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/contexts/AuthContext.jsx)
- [`ReceptionistAppointments.jsx`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/pages/ReceptionistAppointments.jsx)

---

#### 3. **useCallback**
```jsx
const memoizedCallback = useCallback(() => {
  // fonction
}, [dependencies])
```

**Signification** : Mémorise une fonction pour éviter sa recréation à chaque render

**Cas d'utilisation dans MedFlow** :
- **AuthContext.jsx** : Mémoiser les fonctions login/signup/logout
  ```jsx
  const login = useCallback(async (email, password) => {
    // logic d'authentification
  }, [])
  ```
- **useApi.js** : Mémoiser la fonction request
  ```jsx
  const request = useCallback(async (method, url, payload) => {
    // logic de requête
  }, [])
  ```

**Avantages** :
- ✅ Performance optimisée
- ✅ Évite les re-renders inutiles
- ✅ Stabilité des références de fonctions

**Fichiers concernés** :
- [`AuthContext.jsx`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/contexts/AuthContext.jsx)
- [`useApi.js`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/hooks/useApi.js)

---

#### 4. **useContext**
```jsx
const value = useContext(MyContext)
```

**Signification** : Accède aux valeurs d'un Context Provider

**Cas d'utilisation dans MedFlow** :
- **AuthContext** : Accéder à l'utilisateur connecté
  ```jsx
  export const useAuth = () => {
    const context = useContext(AuthContext)
    return context // { user, login, logout, isAuthenticated }
  }
  ```

**Utilisation dans les composants** :
```jsx
// Dans Dashboard.jsx
const { user } = useAuth()
```

**Fichiers concernés** :
- [`AuthContext.jsx`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/contexts/AuthContext.jsx)
- [`Dashboard.jsx`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/pages/Dashboard.jsx)
- [`Profile.jsx`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/pages/Profile.jsx)

---

#### 5. **useNavigate** (React Router)
```jsx
const navigate = useNavigate()
navigate('/path')
```

**Signification** : Navigation programmatique entre les routes

**Cas d'utilisation dans MedFlow** :
- **Redirections après login**
- **Navigation depuis les composants**
  ```jsx
  const navigate = useNavigate()
  navigate('/receptionist/dashboard')
  ```

**Fichiers concernés** :
- [`ReceptionistDoctors.jsx`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/pages/ReceptionistDoctors.jsx)
- [`ReceptionistDashboard.jsx`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/pages/ReceptionistDashboard.jsx)

---

### **Hooks Personnalisés (Custom Hooks)**

#### 1. **useAuth**
**Fichier** : [`AuthContext.jsx`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/contexts/AuthContext.jsx)

```jsx
const { user, login, logout, signup, isAuthenticated, loading } = useAuth()
```

**Signification** : Hook personnalisé pour gérer l'authentification

**Fonctionnalités** :
- `user` - Objet utilisateur connecté
- `login(email, password)` - Connexion
- `logout()` - Déconnexion
- `signup(...)` - Inscription
- `isAuthenticated` - Statut d'authentification
- `loading` - État de chargement

**Utilisation** :
```jsx
// Dans Login.jsx
const { login } = useAuth()
const handleLogin = async () => {
  await login(email, password)
}
```

---

#### 2. **useApi**
**Fichier** : [`useApi.js`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/frontend/src/hooks/useApi.js)

```jsx
const { request, loading, error, data, getDoctorAppointments, ... } = useApi()
```

**Signification** : Hook personnalisé pour les requêtes API avec gestion automatique du loading/error

**Fonctionnalités** :
- `request(method, url, payload)` - Requête générique
- `loading` - État de chargement
- `error` - Gestion des erreurs
- `data` - Données de réponse
- **Méthodes prédéfinies** :
  - `getProfile()`
  - `addAvailability()`
  - `createAppointment()`
  - `getDoctorAppointments()`
  - `getAllAppointments()`

**Exemple d'utilisation** :
```jsx
// Dans Dashboard.jsx
const { getDoctorAppointments, loading } = useApi()

useEffect(() => {
  const fetchData = async () => {
    const appointments = await getDoctorAppointments()
    setRecentData(prev => ({ ...prev, appointments }))
  }
  fetchData()
}, [])
```

**Avantages** :
- ✅ Centralisation de la logique API
- ✅ Gestion automatique des états (loading/error)
- ✅ Réutilisabilité maximale
- ✅ Intégration avec Axios et JWT

---

## 🔧 Technologies Backend (Django)

### **Framework & Core**

#### 1. **Django 5.2.8**
- **Description** : Framework web Python
- **Utilisation** : API REST backend
- **Configuration** : [`settings.py`](file:///c:/Users/farah/OneDrive/Desktop/project/projet1/Saas/config/settings.py)

#### 2. **Django REST Framework**
- **Description** : Toolkit pour créer des Web APIs
- **Utilisation** : Endpoints REST
- **Configuration** :
  ```python
  REST_FRAMEWORK = {
      'DEFAULT_AUTHENTICATION_CLASSES': (
          'rest_framework_simplejwt.authentication.JWTAuthentication',
      ),
  }
  ```

#### 3. **Simple JWT**
- **Description** : Authentification JWT pour Django REST Framework
- **Configuration** :
  ```python
  SIMPLE_JWT = {
      'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
      'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
  }
  ```

### **Applications Django**

#### 1. **users**
- Gestion des utilisateurs (medecin, patient, receptionist, admin)
- Authentification JWT

#### 2. **appointment**
- Gestion des rendez-vous
- Disponibilités des médecins

#### 3. **facturation**
- Génération de factures
- Gestion des paiements

#### 4. **messaging**
- Messagerie entre utilisateurs

### **Base de données**

#### SQLite
- **Utilisation** : Base de données de développement
- **Fichier** : `db.sqlite3`

### **Middleware & Security**

#### 1. **CORS Headers**
- **Package** : `django-cors-headers`
- **Utilisation** : Autoriser les requêtes cross-origin depuis React
- **Configuration** :
  ```python
  CORS_ALLOW_ALL_ORIGINS = True  # Développement
  CORS_ALLOW_CREDENTIALS = True
  ```

---

## 📁 Structure du Projet

```
projet1/
├── frontend/                    # Application React
│   ├── src/
│   │   ├── api/                # Configuration Axios
│   │   ├── components/         # Composants réutilisables
│   │   ├── contexts/           # React Contexts (Auth)
│   │   ├── hooks/              # Custom Hooks (useApi)
│   │   ├── pages/              # Pages/Routes
│   │   ├── App.jsx             # Configuration routes
│   │   └── main.jsx            # Point d'entrée
│   ├── package.json            # Dépendances npm
│   └── vite.config.js          # Configuration Vite
│
└── Saas/                        # Backend Django
    ├── config/                  # Configuration Django
    │   └── settings.py
    ├── users/                   # App utilisateurs
    ├── appointment/             # App rendez-vous
    ├── facturation/             # App facturation
    ├── messaging/               # App messagerie
    ├── manage.py
    └── db.sqlite3              # Base de données
```

---

## 🔐 Flux d'authentification

1. **Connexion** : Frontend → POST `/users/login/` → Backend
2. **Réception tokens** : `access_token` + `refresh_token`
3. **Storage** : `localStorage.setItem('access_token', ...)`
4. **Axios Interceptor** : Ajout automatique du header `Authorization: Bearer {token}`
5. **Requêtes protégées** : Toutes les requêtes API incluent le JWT
6. **Context** : `AuthContext` maintient l'état global de l'utilisateur

---

## 🎨 Patterns de Design

### 1. **Component-Based Architecture**
Tous les éléments UI sont des composants React réutilisables :
- `Button.jsx`, `Card.jsx`, `Input.jsx`, `Modal.jsx`

### 2. **Protected Routes**
Routes protégées par rôle :
```jsx
<ProtectedRoute allowedRoles={['medecin']}>
  <Dashboard />
</ProtectedRoute>
```

### 3. **Custom Hooks Pattern**
Logique réutilisable extraite dans des hooks :
- `useAuth()` - Authentification
- `useApi()` - Requêtes API

### 4. **Context Provider Pattern**
État global via Context API :
```jsx
<AuthProvider>
  <App />
</AuthProvider>
```

---

## 📊 Récapitulatif des Hooks

| Hook | Type | Utilisation | Fichiers principaux |
|------|------|-------------|---------------------|
| `useState` | Natif | État local | Tous les composants |
| `useEffect` | Natif | Effets de bord | Dashboard, Profile, Lists |
| `useCallback` | Natif | Mémoisation fonctions | AuthContext, useApi |
| `useContext` | Natif | Accès Context | useAuth |
| `useNavigate` | Router | Navigation | Pages avec redirections |
| `useAuth` | Custom | Authentification | Dashboard, Login, Profile |
| `useApi` | Custom | Requêtes API | Toutes les pages avec data |

---

## 🚀 Commandes utiles

### Frontend
```bash
npm run dev          # Démarrer le serveur de développement
npm run build        # Build de production
npm run lint         # Vérification ESLint
```

### Backend
```bash
python manage.py runserver        # Démarrer Django
python manage.py migrate          # Appliquer les migrations
python manage.py createsuperuser  # Créer un admin
```

---

## 📝 Notes importantes

> [!IMPORTANT]
> - Les hooks doivent **toujours** être appelés au niveau racine d'un composant
> - Ne jamais appeler de hooks dans des conditions, boucles ou fonctions imbriquées
> - Les hooks personnalisés doivent commencer par "use" (convention)

> [!TIP]
> - Utilisez `useCallback` pour les fonctions passées en props aux composants enfants
> - Utilisez `useEffect` avec un tableau de dépendances vide `[]` pour l'équivalent de `componentDidMount`
> - Le custom hook `useApi` centralise toute la logique de requêtes HTTP

---

**Version** : 1.0  
**Date** : Décembre 2024  
**Projet** : MedFlow SaaS
