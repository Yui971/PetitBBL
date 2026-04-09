# Caprice des Îles — Menu digital

Menu web bilingue (FR/EN) pour le restaurant Caprice des Îles.
Stack : HTML / CSS / JS vanilla + JSON. Aucune dépendance.

## Structure

```
resto-menu/
├── index.html
├── css/style.css
├── js/app.js
├── data/menu.json    ← TOUTES les données du menu
└── img/              ← logo + futures photos
    └── logo.png      (à ajouter)
```

## Lancer en local

Le fetch du JSON nécessite un serveur (pas un simple double-clic sur index.html).

**Option 1 — VS Code Live Server (le plus simple)**
1. Installer l'extension "Live Server" dans VS Code
2. Clic droit sur `index.html` → "Open with Live Server"

**Option 2 — Python**
```bash
cd resto-menu
python3 -m http.server 8000
```
Puis ouvrir http://localhost:8000

## Comment modifier la carte

Tout se passe dans `data/menu.json`. Pas besoin de toucher au code.

### Ajouter un plat
Dans la catégorie voulue, ajouter un objet dans le tableau `plats` :
```json
{
  "id": "mon-nouveau-plat",
  "nom": { "fr": "Nom FR", "en": "English name" },
  "prix": 15.00,
  "disponible": true,
  "tags": []
}
```

### Marquer un plat en rupture
Passer `"disponible": false` et ajouter `"rupture"` dans les tags.

### Tags disponibles
- `signature` → badge doré "Plat signature"
- `local` → badge "Spécialité antillaise"
- `plat-du-jour` → badge rouge "Plat du jour"
- `rupture` → grise le plat
- `sauce` → indique sauce au choix

## À ajouter
- [ ] Logo dans `img/logo.png`
- [ ] QR code à imprimer une fois déployé
- [ ] Migration vers Google Sheets (v2)

## Palette (extraite du logo)
- Turquoise `#3FC5D4`
- Jaune `#F5D547`
- Rouge Caprice `#C8102E`
- Or étoile `#E8B830`
- Vert palme `#2D6B3F`
- Crème `#FBF6E9`
