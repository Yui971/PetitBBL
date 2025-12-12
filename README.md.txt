Portfolio - Chrisnaël BERDIER

 📌 Ce qui a été réalisé

 Structure et navigation
- 3 pages HTML : Accueil, Projets, Contact avec navigation cohérente
- Menu burger responsive : accessible au clavier (Tab, Échap) avec gestion du focus
- Fil d'Ariane : navigation contextuelle sur chaque page
- Bouton "retour en haut" : visible après 300px de scroll

 Interactivité JavaScript
- Thème clair/sombre persistant : mémorisé via localStorage
- Validation de formulaire : messages d'erreur accessibles (aria-invalid, role="alert")
- Compteur de caractères : limite de 280 caractères pour le message avec indication visuelle
- Chargement dynamique : projets affichés depuis projets.json via fetch API
- Bouton "Afficher plus" : pour les descriptions longues sur les cartes projets

 Accessibilité
- Skip link pour accéder directement au contenu
- Labels et aria-labels sur tous les éléments interactifs
- Gestion du focus au clavier (Tab, Shift+Tab, Échap)
- Messages d'erreur annoncés aux lecteurs d'écran

 ⚠️ Limites actuelles

- Formulaire : aucun backend, les données ne sont pas réellement envoyées
- Filtres projets : non implémentés (prévu pour les data-tag)
- Images : non optimisées pour le web (formats WebP/AVIF non utilisés)
- Tests : non testé sur tous les navigateurs et lecteurs d'écran

 🛠️ Technologies utilisées

- HTML5 sémantique
- CSS3 avec variables custom (thème)
- JavaScript vanilla (ES6+)
- Fetch API pour le chargement JSON

---

Étudiant : Chrisnaël BERDIER  
Formation : BUT MMI  
Date : Novembre 2025