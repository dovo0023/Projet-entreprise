# À ajuster

Liste vivante des limites connues de la maquette et des décisions à trancher en équipe. Pas bloquant pour la démo, mais à traiter avant tout développement "produit réel".

## Moteur IA / Planning (B2C)
- [ ] Filtres de rythme des repas ("Petit-déj", "Midi froid", "Soir chaud") retirés de l'UI de Planning car non modélisés par le moteur — à concevoir si on veut vraiment distinguer repas froids/chauds dans la sélection de recettes.
- [ ] Le graphique de poids (Recharts `ResponsiveContainer`) peut apparaître tronqué une fraction de seconde au tout premier rendu avant de se stabiliser — cosmétique, sans impact réel à l'usage.
- [ ] La passe d'optimisation locale (2-opt) recalcule les scores à partir des compteurs d'usage du remplissage initial et ne les met pas à jour entre deux échanges dans la même passe — approximation acceptable pour une démo, mais à corriger si on formalise l'algorithme.
- [ ] Le rapprochement des allergènes personnalisés (texte libre ajouté par l'utilisateur en onboarding) ne filtre aucune recette : seuls les tags prédéfinis (`ALLERGEN_OPTIONS`) sont reconnus par le moteur.
- [ ] Base de 28 recettes seulement : suffisant pour la démo, à étoffer nettement pour une vraie variété sur plusieurs semaines.

## B2B (espace praticien)
- [ ] Un seul patient ("Camille") est réellement relié au contexte B2C ; les autres patients du portefeuille sont des données statiques non connectées à un vrai compte.
- [ ] La messagerie praticien↔patient n'est pas persistée ni synchronisée avec un espace de messagerie côté app patiente (le bouton "message" du B2C n'ouvre pas encore ce fil).
- [ ] Les indicateurs "à risque de décrochage" sont des règles simplifiées (tendance d'observance) — pas un vrai modèle prédictif basé sur les facteurs cliniques (âge au premier régime, % masse grasse, échelle SCL-90, perte de poids précoce) mentionnés dans la littérature fournie.
- [ ] Pas de gestion de compte multi-praticiens, de rôles/permissions, ni de vue "cabinet" agrégée.
- [ ] Pas de flux d'invitation réel (le "code de partage" est affiché mais non vérifiable/consommable).

## Transverse
- [ ] Aucune persistance : tout l'état (profil, planning, messages, prescriptions) vit en mémoire et se réinitialise au rechargement complet de la page.
- [ ] Pas de backend/API réelle : authentification, connexion tierce (Google/Apple), paiement d'abonnement et intégration Drive/click & collect sont uniquement des maquettes visuelles sans logique serveur.
- [ ] Pas de tests automatisés (unitaires ou end-to-end).
