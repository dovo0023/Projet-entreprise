# À ajuster

Liste vivante des limites connues de la maquette et des décisions à trancher en équipe. Pas bloquant pour la démo, mais à traiter avant tout développement "produit réel".

## Choix de rôle & accès (nouveau)
- [x] ~~L'espace praticien était accessible par un lien caché depuis l'app patiente~~ → résolu : le rôle (patient / praticien) se choisit sur l'écran d'accueil, avant inscription/connexion ; les raccourcis croisés (« Découvrir l'espace praticien », « Voir l'app patient ») ont été retirés.
- [ ] Rien n'empêche techniquement de taper directement `#/pro` dans l'URL — la séparation est une UX de bon sens (pas de bouton), pas une vraie barrière d'accès. Une fois un backend en place, l'accès à `/pro` devra être gardé par une vraie session praticien.

## Courses = menu direct → détail panier → magasin → validation (mis à jour)
- [x] ~~L'onglet Courses proposait 3 menus à choisir~~ → résolu : un seul menu jour par jour (midi/soir/encas) est généré directement ; chaque plat a son propre bouton « Régénérer un repas » plutôt qu'un choix parmi plusieurs menus.
- [x] ~~"Réglages du plan" et "Régénérer la semaine" étaient dans Planning~~ → déplacés dans Courses, dans un panneau **Préférences** catégorisé (temps de préparation, répartition chaud/froid, encas, budget, profil nutritionnel) plutôt qu'une simple rangée de filtres.
- [x] ~~Pas de notion chaud/froid ni d'encas~~ → résolu : chaque recette midi/soir est taguée chaud ou froid, un nouveau pool de 8 recettes d'encas existe, et le moteur répartit les calories entre créneaux dynamiquement selon que des encas sont activés (matin, après-midi ou les deux).
- [x] ~~Parcours en 4 étapes rigides (menu → plats → ingrédients → magasin)~~ → simplifié en modèle « hub » : depuis le menu, deux actions au choix — « Détail du panier » (optionnel, pour cocher ce qu'on a déjà) ou « Continuer » (direct vers les magasins) ; les deux reviennent au menu.
- [ ] Le filtre "catégorie" reste basé sur le créneau (midi/soir/encas), le temps de préparation et le chaud/froid, faute de vraie taxonomie de recettes (cuisine du monde, régime, etc.) — à enrichir si on veut un vrai filtre par style de plat.
- [ ] Le prix par magasin est une estimation simplifiée (nombre d'articles restants × prix moyen × multiplicateur par enseigne), pas un vrai catalogue de prix produit par produit.
- [ ] Le petit-déjeuner reste hors du parcours Courses (géré uniquement dans Aujourd'hui/Planning) — choix assumé, à confirmer avec l'équipe.
- [x] ~~Le tri/préférences (temps de préparation, chaud/froid) ne changeait presque rien au menu généré~~ → **bug corrigé** : c'était de simples pénalités de score, largement écrasées par les autres critères (macros, budget). Ce sont maintenant de vrais filtres (avec repli automatique sur toutes les recettes si un filtre viderait un créneau, pour ne jamais casser la génération). Corrigé en même temps : le pool de recettes n'avait aucun plat de plus de 25 min ni aucun plat froid le soir, ce qui rendait "30 min +" et "froid le soir" silencieusement inopérants — ajout de 3 recettes soir froides et allongement de 5 recettes existantes pour couvrir la bande "30 min +".

## Planning : permutation entre jours (mis à jour)
- [x] ~~Pas de moyen d'échanger un plat avec un autre jour~~ → résolu : chaque repas peut être permuté avec le même créneau d'un autre jour (un midi ne se propose qu'avec d'autres midis, etc.), avec un avertissement si un plat très frais (tier 1) est repoussé tard dans la semaine.
- [x] ~~Un bouton "Remplacer automatiquement" cohabitait avec la permutation~~ → retiré de Planning : sur cet onglet, on ne peut plus qu'échanger avec un repas équivalent d'un autre jour. Le remplacement automatique par une nouvelle recette reste disponible ailleurs (Courses via "Régénérer un repas", Aujourd'hui via "Remplacement d'urgence").
- [ ] L'avertissement de fraîcheur est un seuil simple (tier + jour cible), pas un vrai calcul de DLC produit par produit.

## Moteur IA / Planning (B2C)
- [ ] Le graphique de poids (Recharts `ResponsiveContainer`) peut apparaître tronqué une fraction de seconde au tout premier rendu avant de se stabiliser — cosmétique, sans impact réel à l'usage.
- [ ] La passe d'optimisation locale (2-opt) recalcule les scores à partir des compteurs d'usage du remplissage initial et ne les met pas à jour entre deux échanges dans la même passe — approximation acceptable pour une démo, mais à corriger si on formalise l'algorithme.
- [ ] Le rapprochement des allergènes personnalisés (texte libre ajouté par l'utilisateur en onboarding) ne filtre aucune recette : seuls les tags prédéfinis (`ALLERGEN_OPTIONS`) sont reconnus par le moteur.
- [ ] Base de 40 recettes (8 petit-déj, 14 midi, 13 soir, 8 encas) : correct pour la démo, à étoffer pour une vraie variété sur plusieurs semaines, surtout si plusieurs préférences restrictives sont combinées (ex. "froid le soir" + "30 min +" ne laisse qu'une poignée de recettes).

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
