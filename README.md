# NutriFlow — Maquette applicative

Maquette cliquable (web, pensée mobile-first) de l'application de nutrition personnalisée : du calcul métabolique à la commande des courses en click & collect / Drive.

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrez `http://localhost:5173` — l'interface se comporte comme un écran de téléphone (cadre visible sur desktop, plein écran sur mobile).

## Écrans couverts

- **Accueil & authentification** : accroche, inscription, connexion, connexion tierce (Google/Apple).
- **Onboarding express en 4 étapes** : identifiants, données physiologiques, objectif corporel, socle de sécurité (allergènes/intolérances) — avec calcul instantané du métabolisme de base (MB) et de la dépense énergétique journalière (DEJ).
- **Bandeau supérieur** : accès profil/compte (haut gauche) et badge d'abonnement (haut droit, avec comparatif des formules).
- **4 onglets de navigation** :
  - *Planning semaine* — vue 7 jours, séquençage par fraîcheur (DLC), filtres, régénération du menu.
  - *Aujourd'hui* — jauge calorique et macros, fiches repas du jour, validation en un clic.
  - *Courses & logistique* — liste consolidée par rayon, estimation du panier, envoi vers le Drive/click & collect.
  - *Progression & santé* — pesée hebdomadaire, courbes de poids et d'observance, espace praticien.

## Stack

React + TypeScript + Vite, Tailwind CSS v4, React Router, Recharts, Lucide (icônes). Toutes les données sont mockées (`src/data/mock.ts`) pour illustrer le parcours.
