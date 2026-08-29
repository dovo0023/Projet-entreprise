# À ajuster

Liste vivante des limites connues de la maquette et des décisions à trancher en équipe. Pas bloquant pour la démo, mais à traiter avant tout développement "produit réel".

## Choix de rôle & accès (nouveau)
- [x] ~~L'espace praticien était accessible par un lien caché depuis l'app patiente~~ → résolu : le rôle (patient / praticien) se choisit sur l'écran d'accueil, avant inscription/connexion ; les raccourcis croisés (« Découvrir l'espace praticien », « Voir l'app patient ») ont été retirés.
- [ ] Rien n'empêche techniquement de taper directement `#/pro` dans l'URL — la séparation est une UX de bon sens (pas de bouton), pas une vraie barrière d'accès. Une fois un backend en place, l'accès à `/pro` devra être gardé par une vraie session praticien.

## Courses = assistant menu → plats → ingrédients → magasin (nouveau)
- [x] ~~L'onglet Courses montrait une liste d'aliments~~ → résolu : nouveau parcours en 4 étapes (choix d'un menu parmi 3 propositions ou menu personnalisé, revue/échange des plats midi+soir avec propositions alternatives réelles, ingrédients déjà à la maison, comparatif de magasins avec recommandation et mode Click & Collect / Click & Collect + Livraison).
- [x] ~~"Réglages du plan" et "Régénérer la semaine" étaient dans Planning~~ → déplacés dans Courses (étape Menu).
- [ ] Le filtre "catégorie" reste basé sur le créneau (midi/soir) et le temps de préparation, faute de vraie taxonomie de recettes (cuisine du monde, régime, etc.) — à enrichir si on veut un vrai filtre par catégorie de plat.
- [ ] Le prix par magasin est une estimation simplifiée (nombre d'articles restants × prix moyen × multiplicateur par enseigne), pas un vrai catalogue de prix produit par produit.
- [ ] Seuls les repas midi/soir passent par ce parcours (le petit-déjeuner reste géré uniquement dans Aujourd'hui/Planning) — choix assumé pour cette itération, à confirmer.

## Planning : permutation entre jours (nouveau)
- [x] ~~Pas de moyen d'échanger un plat avec un autre jour~~ → résolu : chaque repas peut être permuté avec le même créneau d'un autre jour, avec un avertissement si un plat très frais (tier 1) est repoussé tard dans la semaine.
- [ ] L'avertissement de fraîcheur est un seuil simple (tier + jour cible), pas un vrai calcul de DLC produit par produit.

## Moteur IA / Planning (B2C)
- [ ] Le graphique de poids (Recharts `ResponsiveContainer`) peut apparaître tronqué une fraction de seconde au tout premier rendu avant de se stabiliser — cosmétique, sans impact réel à l'usage.
- [ ] La passe d'optimisation locale (2-opt) recalcule les scores à partir des compteurs d'usage du remplissage initial et ne les met pas à jour entre deux échanges dans la même passe — approximation acceptable pour une démo, mais à corriger si on formalise l'algorithme.
- [ ] Le rapprochement des allergènes personnalisés (texte libre ajouté par l'utilisateur en onboarding) ne filtre aucune recette : seuls les tags prédéfinis (`ALLERGEN_OPTIONS`) sont reconnus par le moteur.
- [ ] Base de 28 recettes seulement : suffisant pour la démo, à étoffer nettement pour une vraie variété sur plusieurs semaines (d'autant plus important maintenant que Courses propose 3 menus différents en parallèle).

## B2B (espace praticien)
- [ ] Un seul patient ("Camille") est réellement relié au contexte B2C ; les 6 autres patients du portefeuille sont des données statiques éditables (prescription, messages) mais non connectées à un vrai compte.
- [ ] Les indicateurs "à risque de décrochage" sont des règles simplifiées (tendance d'observance sur les dernières semaines) — pas un vrai modèle prédictif basé sur les facteurs cliniques (âge au premier régime, % masse grasse, échelle SCL-90, perte de poids précoce) mentionnés dans la littérature fournie.
- [ ] Pas de gestion de compte multi-praticiens, de rôles/permissions, ni de vue "cabinet" agrégée.
- [ ] Le code de partage patient est unique et statique (`NF-72K9`) pour la démo — un vrai système générerait un code par patient et le invaliderait après usage.

## Démo B2C ↔ B2B
- **Important pour présenter** : la synchronisation en direct (messages, prescription) ne fonctionne de façon garantie que **dans un même onglet de navigateur**, en changeant de vue via les liens internes du produit plutôt qu'en tapant une nouvelle URL ou en ouvrant un second onglet/appareil. La persistance locale (localStorage) permet de retrouver l'état après un rechargement, mais deux onglets ouverts en parallèle ne se mettent PAS à jour l'un l'autre en direct (pas de vrai backend/websocket).
- [ ] Le compteur de messages non lus (badge rouge) affiche le nombre total de messages, pas le nombre réellement "non lus" — acceptable en démo, à corriger avec un vrai statut lu/non lu.

## Transverse
- [x] Persistance locale : l'état B2C (profil, planning, courses, messages) et B2B (portefeuille, prescriptions, messages) est sauvegardé dans le `localStorage` du navigateur et restauré au rechargement. Reste vrai : rien n'est partagé entre deux navigateurs/appareils différents (voir note démo ci-dessus). Le format de stockage a changé avec le nouveau parcours Courses (clé `nutriflow_b2c_state_v2`) : les anciennes données de démo en `v1` sont ignorées, pas migrées.
- [ ] Pas de backend/API réelle : authentification, connexion tierce (Google/Apple), paiement d'abonnement et intégration Drive/click & collect sont uniquement des maquettes visuelles sans logique serveur.
- [ ] Pas de tests automatisés (unitaires ou end-to-end).
