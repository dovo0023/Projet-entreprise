# À ajuster

Liste vivante des limites connues de la maquette et des décisions à trancher en équipe. Pas bloquant pour la démo, mais à traiter avant tout développement "produit réel".

## Pour la démo devant des diététiciens
- [x] ~~Le "code de partage" n'était pas fonctionnel~~ → résolu : la patiente-démo doit être ajoutée au portefeuille du praticien via son vrai code (`NF-72K9`, copiable), rejouant le mécanisme d'invitation du cahier des charges.
- [x] ~~La messagerie B2C et B2B étaient déconnectées~~ → résolu : même fil de discussion des deux côtés pour la patiente-démo liée.
- **Important pour présenter** : la synchronisation en direct (messages, prescription) ne fonctionne de façon garantie que **dans un même onglet de navigateur**, en changeant de vue via les liens internes du produit (« Découvrir l'espace praticien », « Voir l'app patient », bouton retour) plutôt qu'en tapant une nouvelle URL ou en ouvrant un second onglet/appareil. La persistance locale (localStorage) permet de retrouver l'état après un rechargement, mais deux onglets ouverts en parallèle ne se mettent PAS à jour l'un l'autre en direct (pas de vrai backend/websocket). Pour la démo : un seul onglet, on bascule entre patiente et praticienne avec les liens du produit.
- [ ] Le compteur de messages non lus (badge rouge) affiche le nombre total de messages, pas le nombre réellement "non lus" — acceptable en démo, à corriger avec un vrai statut lu/non lu.

## Moteur IA / Planning (B2C)
- [ ] Filtres de rythme des repas ("Petit-déj", "Midi froid", "Soir chaud") retirés de l'UI de Planning car non modélisés par le moteur — à concevoir si on veut vraiment distinguer repas froids/chauds dans la sélection de recettes.
- [ ] Le graphique de poids (Recharts `ResponsiveContainer`) peut apparaître tronqué une fraction de seconde au tout premier rendu avant de se stabiliser — cosmétique, sans impact réel à l'usage.
- [ ] La passe d'optimisation locale (2-opt) recalcule les scores à partir des compteurs d'usage du remplissage initial et ne les met pas à jour entre deux échanges dans la même passe — approximation acceptable pour une démo, mais à corriger si on formalise l'algorithme.
- [ ] Le rapprochement des allergènes personnalisés (texte libre ajouté par l'utilisateur en onboarding) ne filtre aucune recette : seuls les tags prédéfinis (`ALLERGEN_OPTIONS`) sont reconnus par le moteur.
- [ ] Base de 28 recettes seulement : suffisant pour la démo, à étoffer nettement pour une vraie variété sur plusieurs semaines.

## B2B (espace praticien)
- [ ] Un seul patient ("Camille") est réellement relié au contexte B2C ; les 6 autres patients du portefeuille sont des données statiques éditables (prescription, messages) mais non connectées à un vrai compte.
- [ ] Les indicateurs "à risque de décrochage" sont des règles simplifiées (tendance d'observance sur les dernières semaines) — pas un vrai modèle prédictif basé sur les facteurs cliniques (âge au premier régime, % masse grasse, échelle SCL-90, perte de poids précoce) mentionnés dans la littérature fournie.
- [ ] Pas de gestion de compte multi-praticiens, de rôles/permissions, ni de vue "cabinet" agrégée.
- [ ] Le code de partage patient est unique et statique (`NF-72K9`) pour la démo — un vrai système générerait un code par patient et le invaliderait après usage.

## Transverse
- [x] ~~Aucune persistance~~ → résolu partiellement : l'état B2C (profil, planning, messages) et B2B (portefeuille, prescriptions, messages) est sauvegardé dans le `localStorage` du navigateur et restauré au rechargement. Reste vrai : rien n'est partagé entre deux navigateurs/appareils différents (voir note démo ci-dessus).
- [ ] Pas de backend/API réelle : authentification, connexion tierce (Google/Apple), paiement d'abonnement et intégration Drive/click & collect sont uniquement des maquettes visuelles sans logique serveur.
- [ ] Pas de tests automatisés (unitaires ou end-to-end).
